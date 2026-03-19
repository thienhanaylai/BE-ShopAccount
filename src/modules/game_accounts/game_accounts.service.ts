import { Injectable, NotFoundException } from '@nestjs/common';
import { GameAccount } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { MediaService } from '../media/media.service';
import { CreateGameAccountDto } from './dto/create-game-account.dto';
import { QueryGameAccountsDto } from './dto/query-game-accounts.dto';
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

  async findAll(query: QueryGameAccountsDto): Promise<{
    data: GameAccount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      categoryId?: string;
      status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN';
      price?: { gte?: number; lte?: number };
      OR?: Array<
        | { username: { contains: string; mode: 'insensitive' } }
        | { email: { contains: string; mode: 'insensitive' } }
        | { rank: { contains: string; mode: 'insensitive' } }
        | { description: { contains: string; mode: 'insensitive' } }
      >;
    } = {};

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.search?.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { username: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
        { rank: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.gameAccount.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.gameAccount.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
