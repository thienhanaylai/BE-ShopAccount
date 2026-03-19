import { Injectable, NotFoundException } from '@nestjs/common';
import { SellRequest } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';
import { QuerySellRequestsDto } from './dto/query-sell-requests.dto';
import { UpdateSellRequestDto } from './dto/update-sell-request.dto';

@Injectable()
export class SellRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSellRequestDto): Promise<SellRequest> {
    return this.prisma.sellRequest.create({
      data: { id: generateId(), ...dto },
    });
  }

  async findAll(query: QuerySellRequestsDto): Promise<{
    data: SellRequest[];
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
      userId?: string;
      status?: 'PENDING' | 'APPROVED' | 'REJECTED';
      price?: { gte?: number; lte?: number };
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sellRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sellRequest.count({ where }),
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

  async findOne(id: string): Promise<SellRequest> {
    const item = await this.prisma.sellRequest.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`SellRequest #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateSellRequestDto): Promise<SellRequest> {
    await this.findOne(id);
    return this.prisma.sellRequest.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.sellRequest.delete({ where: { id } });
  }
}
