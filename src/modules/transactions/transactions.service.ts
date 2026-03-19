import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction, TransactionMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    await this.ensureUserExists(dto.userId);

    const recipientUserId = await this.resolveRecipientUserId(
      dto.method,
      dto.userId,
      dto.recipientUserId,
    );

    return this.prisma.transaction.create({
      data: { id: generateId(), ...dto, recipientUserId },
    });
  }

  async findAll(query: QueryTransactionsDto): Promise<{
    data: Transaction[];
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
      orderId?: string;
      recipientUserId?: string;
      method?: TransactionMethod;
      status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (query.userId) where.userId = query.userId;
    if (query.orderId) where.orderId = query.orderId;
    if (query.recipientUserId) where.recipientUserId = query.recipientUserId;
    if (query.method) where.method = query.method;
    if (query.status) where.status = query.status;

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
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

  async findOne(id: string): Promise<Transaction> {
    const item = await this.prisma.transaction.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Transaction #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
    const existing = await this.findOne(id);

    if (dto.userId) {
      await this.ensureUserExists(dto.userId);
    }

    const nextUserId = dto.userId ?? existing.userId;
    const nextMethod = dto.method ?? existing.method;
    const nextRecipientSource =
      dto.recipientUserId !== undefined
        ? dto.recipientUserId
        : (existing.recipientUserId ?? undefined);

    const recipientUserId = await this.resolveRecipientUserId(
      nextMethod,
      nextUserId,
      nextRecipientSource,
    );

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        recipientUserId,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.transaction.delete({ where: { id } });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }
  }

  private async resolveRecipientUserId(
    method: TransactionMethod,
    userId: string,
    recipientUserId?: string,
  ): Promise<string | undefined> {
    if (method !== TransactionMethod.TRANSFER) {
      return undefined;
    }

    if (!recipientUserId) {
      throw new BadRequestException('recipientUserId is required for transfer');
    }

    if (recipientUserId === userId) {
      throw new BadRequestException('Cannot transfer to the same user');
    }

    await this.ensureUserExists(recipientUserId);
    return recipientUserId;
  }
}
