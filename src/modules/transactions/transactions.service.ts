import { Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: { id: generateId(), ...dto },
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
    await this.findOne(id);
    return this.prisma.transaction.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.transaction.delete({ where: { id } });
  }
}
