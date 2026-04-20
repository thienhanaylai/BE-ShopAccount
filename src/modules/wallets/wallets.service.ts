import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Transaction,
  TransactionMethod,
  TransactionStatus,
} from '@prisma/client';
import { generateId } from '../../common/utils/nanoid.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAdjustBalanceDto } from './dto/admin-adjust-balance.dto';
import { CreateTopUpDto } from './dto/create-top-up.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WalletHistoryQueryDto } from './dto/wallet-history-query.dto';
import { BalanceAdjustDirection } from './dto/wallet.enums';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async topUp(userId: string, dto: CreateTopUpDto) {
    const { amount } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    return this.prisma.$transaction(async (tx) => {
      const before = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });
      if (!before) throw new NotFoundException(`User #${userId} not found`);

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: amount },
          balanceUpdatedAt: new Date(),
        },
        select: { id: true, balance: true, balanceUpdatedAt: true },
      });

      const transaction = await tx.transaction.create({
        data: {
          id: generateId(),
          userId,
          method: TransactionMethod.TOP_UP,
          price: amount,
          status: TransactionStatus.SUCCESS,
        },
      });

      return {
        userId: updatedUser.id,
        balanceBefore: before.balance,
        balanceAfter: updatedUser.balance,
        balanceUpdatedAt: updatedUser.balanceUpdatedAt,
        transaction,
      };
    });
  }

  async withdraw(userId: string, dto: CreateWithdrawDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true },
    });
    if (!user) throw new NotFoundException(`User #${userId} not found`);
    if (user.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const before = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });
      if (!before) throw new NotFoundException(`User #${userId} not found`);
      if (before.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: dto.amount },
          balanceUpdatedAt: new Date(),
        },
        select: { id: true, balance: true, balanceUpdatedAt: true },
      });

      const transaction = await tx.transaction.create({
        data: {
          id: generateId(),
          userId,
          method: TransactionMethod.WITHDRAW,
          price: dto.amount,
          status: TransactionStatus.SUCCESS,
        },
      });

      return {
        userId: updatedUser.id,
        balanceBefore: before.balance,
        balanceAfter: updatedUser.balance,
        balanceUpdatedAt: updatedUser.balanceUpdatedAt,
        transaction,
      };
    });
  }

  async transfer(fromUserId: string, dto: CreateTransferDto) {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('Cannot transfer to the same user');
    }

    const [fromUser, toUser] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: fromUserId },
        select: { id: true, balance: true },
      }),
      this.prisma.user.findUnique({
        where: { id: dto.toUserId },
        select: { id: true },
      }),
    ]);

    if (!fromUser) throw new NotFoundException(`User #${fromUserId} not found`);
    if (!toUser) throw new NotFoundException(`User #${dto.toUserId} not found`);
    if (fromUser.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const senderBefore = await tx.user.findUnique({
        where: { id: fromUserId },
        select: { balance: true },
      });
      if (!senderBefore) {
        throw new NotFoundException(`User #${fromUserId} not found`);
      }
      if (senderBefore.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const receiverBefore = await tx.user.findUnique({
        where: { id: dto.toUserId },
        select: { balance: true },
      });
      if (!receiverBefore) {
        throw new NotFoundException(`User #${dto.toUserId} not found`);
      }

      const [sender, receiver] = await Promise.all([
        tx.user.update({
          where: { id: fromUserId },
          data: {
            balance: { decrement: dto.amount },
            balanceUpdatedAt: new Date(),
          },
          select: { id: true, balance: true },
        }),
        tx.user.update({
          where: { id: dto.toUserId },
          data: {
            balance: { increment: dto.amount },
            balanceUpdatedAt: new Date(),
          },
          select: { id: true, balance: true },
        }),
      ]);

      const [debitTxn, creditTxn] = await Promise.all([
        tx.transaction.create({
          data: {
            id: generateId(),
            userId: fromUserId,
            recipientUserId: dto.toUserId,
            method: TransactionMethod.TRANSFER,
            price: dto.amount,
            status: TransactionStatus.SUCCESS,
          },
        }),
        tx.transaction.create({
          data: {
            id: generateId(),
            userId: dto.toUserId,
            recipientUserId: fromUserId,
            method: TransactionMethod.TRANSFER,
            price: dto.amount,
            status: TransactionStatus.SUCCESS,
          },
        }),
      ]);

      return {
        fromUser: {
          userId: sender.id,
          balanceBefore: senderBefore.balance,
          balanceAfter: sender.balance,
          transaction: debitTxn,
        },
        toUser: {
          userId: receiver.id,
          balanceBefore: receiverBefore.balance,
          balanceAfter: receiver.balance,
          transaction: creditTxn,
        },
      };
    });
  }

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true, balanceUpdatedAt: true },
    });
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    return {
      userId: user.id,
      balance: user.balance,
      balanceUpdatedAt: user.balanceUpdatedAt,
    };
  }

  async getHistory(userId: string, query: WalletHistoryQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      userId: string;
      method?: TransactionMethod;
      status?: TransactionStatus;
      createdAt?: { gte?: Date; lte?: Date };
    } = { userId };

    if (query.type) where.method = query.type;
    if (query.status) where.status = query.status;

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTopUpHistory(
    query: WalletHistoryQueryDto,
  ): Promise<WalletHistoryResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: {
      method: TransactionMethod;
      status?: TransactionStatus;
      createdAt?: { gte?: Date; lte?: Date };
    } = { method: TransactionMethod.TOP_UP };

    if (query.status) where.status = query.status;

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adminAdjustBalance(dto: AdminAdjustBalanceDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { id: true, balance: true },
    });
    if (!user) throw new NotFoundException(`User #${dto.userId} not found`);

    if (
      dto.direction === BalanceAdjustDirection.DEBIT &&
      user.balance < dto.amount
    ) {
      throw new BadRequestException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const before = await tx.user.findUnique({
        where: { id: dto.userId },
        select: { balance: true },
      });
      if (!before) throw new NotFoundException(`User #${dto.userId} not found`);

      if (
        dto.direction === BalanceAdjustDirection.DEBIT &&
        before.balance < dto.amount
      ) {
        throw new BadRequestException('Insufficient balance');
      }

      const updated = await tx.user.update({
        where: { id: dto.userId },
        data: {
          balance:
            dto.direction === BalanceAdjustDirection.CREDIT
              ? { increment: dto.amount }
              : { decrement: dto.amount },
          balanceUpdatedAt: new Date(),
        },
        select: { id: true, balance: true, balanceUpdatedAt: true },
      });

      const transaction = await tx.transaction.create({
        data: {
          id: generateId(),
          userId: dto.userId,
          method:
            dto.direction === BalanceAdjustDirection.CREDIT
              ? TransactionMethod.TOP_UP
              : TransactionMethod.WITHDRAW,
          price: dto.amount,
          status: TransactionStatus.SUCCESS,
        },
      });

      return {
        userId: updated.id,
        balanceBefore: before.balance,
        balanceAfter: updated.balance,
        balanceUpdatedAt: updated.balanceUpdatedAt,
        reason: dto.reason,
        transaction,
      };
    });
  }
}

export type WalletHistoryItem = Transaction;

export type WalletHistoryResponse = {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
