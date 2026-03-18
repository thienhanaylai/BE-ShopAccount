import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transaction, TransactionMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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

  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
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
