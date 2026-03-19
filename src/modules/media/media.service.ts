import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { UploadImageDto } from './dto/upload-image.dto';

type UploadableFile = {
  buffer?: Buffer;
};

type CloudinaryImageResource = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
};

type CloudinaryApiError = {
  http_code?: number;
  message?: string;
};

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadImage(file: UploadableFile | undefined, dto: UploadImageDto) {
    if (!file?.buffer) {
      throw new BadRequestException('Image file is required');
    }

    const folder = dto.folder?.trim() || undefined;
    const result = await this.uploadBuffer(file.buffer, folder);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      folder,
    };
  }

  async getImageDetails(publicId: string) {
    const normalizedPublicId = this.normalizePublicId(publicId);

    try {
      const rawResource: unknown = await cloudinary.api.resource(
        normalizedPublicId,
        {
          resource_type: 'image',
        },
      );
      const resource = this.toCloudinaryImageResource(rawResource);

      return {
        publicId: resource.public_id,
        url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        bytes: resource.bytes,
        createdAt: resource.created_at,
      };
    } catch (error: unknown) {
      const cloudinaryError = error as CloudinaryApiError;
      if (cloudinaryError.http_code === 404) {
        throw new NotFoundException(`Image ${normalizedPublicId} not found`);
      }

      throw new InternalServerErrorException('Failed to fetch image details');
    }
  }

  getImageUrl(publicId: string) {
    const normalizedPublicId = this.normalizePublicId(publicId);
    return cloudinary.url(normalizedPublicId, { secure: true });
  }

  private normalizePublicId(publicId: string): string {
    const normalizedPublicId = publicId?.trim();

    if (!normalizedPublicId) {
      throw new BadRequestException('publicId is required');
    }

    return normalizedPublicId;
  }

  private uploadBuffer(
    buffer: Buffer,
    folder?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message));
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary did not return a result'));
            return;
          }

          resolve(result);
        },
      );

      stream.end(buffer);
    });
  }

  private toCloudinaryImageResource(value: unknown): CloudinaryImageResource {
    if (!this.isCloudinaryImageResource(value)) {
      throw new InternalServerErrorException('Invalid image resource response');
    }

    return value;
  }

  private isCloudinaryImageResource(
    value: unknown,
  ): value is CloudinaryImageResource {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      typeof record.public_id === 'string' &&
      typeof record.secure_url === 'string' &&
      typeof record.width === 'number' &&
      typeof record.height === 'number' &&
      typeof record.format === 'string' &&
      typeof record.bytes === 'number' &&
      typeof record.created_at === 'string'
    );
  }
}
