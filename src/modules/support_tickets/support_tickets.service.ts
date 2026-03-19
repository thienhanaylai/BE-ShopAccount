import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportTicket } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { QuerySupportTicketsDto } from './dto/query-support-tickets.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupportTicketDto): Promise<SupportTicket> {
    return this.prisma.supportTicket.create({
      data: { id: generateId(), ...dto },
    });
  }

  async findAll(query: QuerySupportTicketsDto): Promise<{
    data: SupportTicket[];
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
      status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
      category?: string;
      createdAt?: { gte?: Date; lte?: Date };
      OR?: Array<
        | { title: { contains: string; mode: 'insensitive' } }
        | { description: { contains: string; mode: 'insensitive' } }
      >;
    } = {};

    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    if (query.search?.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
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

  async findOne(id: string): Promise<SupportTicket> {
    const item = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`SupportTicket #${id} not found`);
    return item;
  }

  async update(
    id: string,
    dto: UpdateSupportTicketDto,
  ): Promise<SupportTicket> {
    await this.findOne(id);
    return this.prisma.supportTicket.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.supportTicket.delete({ where: { id } });
  }
}
