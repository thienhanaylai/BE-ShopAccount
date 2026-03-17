import { Injectable, NotFoundException } from '@nestjs/common';
import { GameCategory } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateGameCategoryDto } from './dto/create-game-category.dto';
import { UpdateGameCategoryDto } from './dto/update-game-category.dto';

@Injectable()
export class GameCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGameCategoryDto): Promise<GameCategory> {
    return this.prisma.gameCategory.create({
      data: {
        id: generateId(),
        ...dto,
      },
    });
  }

  async findAll(): Promise<GameCategory[]> {
    return this.prisma.gameCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
