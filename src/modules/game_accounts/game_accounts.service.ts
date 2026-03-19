import { Injectable, NotFoundException } from '@nestjs/common';
import { GameAccount } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { MediaService } from '../media/media.service';
import { CreateGameAccountDto } from './dto/create-game-account.dto';
import { UpdateGameAccountDto } from './dto/update-game-account.dto';

@Injectable()
export class GameAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(
    dto: CreateGameAccountDto,
    imageFiles?: Express.Multer.File[],
  ): Promise<GameAccount> {
    let images = dto.images ?? [];

    if (imageFiles?.length) {
      const uploadedImages = await Promise.all(
        imageFiles.map((file) =>
          this.mediaService.uploadImage(file, {
            folder: 'game-accounts',
          }),
        ),
      );

      images = [...images, ...uploadedImages.map((item) => item.url)];
    }

    return this.prisma.gameAccount.create({
      data: {
        id: generateId(),
        ...dto,
        images,
      },
    });
  }

  async findAll(): Promise<GameAccount[]> {
    return this.prisma.gameAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<GameAccount> {
    const item = await this.prisma.gameAccount.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`GameAccount #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateGameAccountDto): Promise<GameAccount> {
    await this.findOne(id);
    return this.prisma.gameAccount.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.gameAccount.delete({ where: { id } });
  }
}
