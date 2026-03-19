import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { MediaService } from '../media/media.service';
import { CreateGameCategoryDto } from './dto/create-game-category.dto';
import { QueryGameCategoriesDto } from './dto/query-game-categories.dto';
import { UpdateGameCategoryDto } from './dto/update-game-category.dto';

@Injectable()
export class GameCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async create(
    dto: CreateGameCategoryDto,
    iconFile?: Express.Multer.File,
  ): Promise<GameCategory> {
    let iconUrl = dto.icon?.trim();

    if (iconFile) {
      const uploaded = await this.mediaService.uploadImage(iconFile, {
        folder: 'game-categories',
      });
      iconUrl = uploaded.url;
    }

    if (!iconUrl) {
      throw new BadRequestException('icon or iconFile is required');
    }

    return this.prisma.gameCategory.create({
      data: {
        id: generateId(),
        ...dto,
        icon: iconUrl,
      },
    });
  }

  async findAll(query: QueryGameCategoriesDto): Promise<{
    data: GameCategory[];
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
      isActive?: boolean;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        slug?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search?.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { slug: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.gameCategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.gameCategory.count({ where }),
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

  async findOne(id: string): Promise<GameCategory> {
    const item = await this.prisma.gameCategory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`GameCategory #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateGameCategoryDto): Promise<GameCategory> {
    await this.findOne(id);
    return this.prisma.gameCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.gameCategory.delete({ where: { id } });
  }
}
