import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetImageDto } from './dto/get-image.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { MediaService } from './media.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ) {
    return this.mediaService.uploadImage(file, dto);
  }

  @Get('details')
  getImageDetails(@Query() query: GetImageDto) {
    return this.mediaService.getImageDetails(query.publicId);
  }

  @Get('url')
  getImageUrl(@Query() query: GetImageDto) {
    return { url: this.mediaService.getImageUrl(query.publicId) };
  }
}
