import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GameAccountStatus,
  OrderStatus,
  Prisma,
  SellRequestStatus,
  TransactionMethod,
  TransactionStatus,
  UserStatus,
} from '@prisma/client';
import { generateId } from '../../common/utils/nanoid.util';
import { PrismaService } from '../../prisma/prisma.service';

type BuyAccountInput = {
  buyerUserId: string;
  gameAccountId: string;
  expectedPrice?: number;
};

type PurchaseHistoryQueryInput = {
  page?: string;
  limit?: string;
};

type PurchasedOrderItem = Prisma.OrderGetPayload<{
  include: {
    gameAccount: {
      include: {
        category: {
          select: {
            id: true;
            name: true;
            slug: true;
          };
        };
      };
    };
    transactions: true;
  };
}>;

export type PurchaseHistoryResult = {
  data: PurchasedOrderItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class AccountTradesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPurchasedAccounts(
    userId: string,
    query: PurchaseHistoryQueryInput,
  ): Promise<PurchaseHistoryResult> {
    const page = this.parsePositiveInt(query.page, 1);
    const limit = Math.min(this.parsePositiveInt(query.limit, 20), 100);
    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    const where = {
      userId,
      status: {
        in: [OrderStatus.PAID, OrderStatus.COMPLETED],
      },
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: {
          gameAccount: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          transactions: {
            where: { method: TransactionMethod.PAYMENT },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async buyAccount(input: BuyAccountInput) {
    const { buyerUserId, gameAccountId, expectedPrice } = input;

    return this.prisma.$transaction(async (tx) => {
      const buyer = await tx.user.findUnique({
        where: { id: buyerUserId },
        select: { id: true, balance: true, status: true },
      });

      if (!buyer) {
        throw new NotFoundException(`User #${buyerUserId} not found`);
      }

      if (buyer.status === UserStatus.BLOCKED) {
        throw new BadRequestException('Blocked users cannot buy accounts');
      }

      const account = await tx.gameAccount.findUnique({
        where: { id: gameAccountId },
      });

      if (!account) {
        throw new NotFoundException(`GameAccount #${gameAccountId} not found`);
      }

      if (account.status !== GameAccountStatus.AVAILABLE) {
        throw new BadRequestException('Game account is not available');
      }

      if (expectedPrice !== undefined && expectedPrice !== account.price) {
        throw new BadRequestException('Price has changed, refresh and retry');
      }

      if (buyer.balance < account.price) {
        throw new BadRequestException('Insufficient balance');
      }

      const soldResult = await tx.gameAccount.updateMany({
        where: {
          id: gameAccountId,
          status: GameAccountStatus.AVAILABLE,
        },
        data: {
          status: GameAccountStatus.SOLD,
        },
      });

      if (soldResult.count === 0) {
        throw new BadRequestException('Game account has been sold already');
      }

      const updatedBuyer = await tx.user.update({
        where: { id: buyerUserId },
        data: {
          balance: { decrement: account.price },
          balanceUpdatedAt: new Date(),
        },
        select: {
          id: true,
          balance: true,
          balanceUpdatedAt: true,
        },
      });

      const order = await tx.order.create({
        data: {
          id: generateId(),
          userId: buyerUserId,
          gameAccountId,
          price: account.price,
          status: OrderStatus.PAID,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          id: generateId(),
          userId: buyerUserId,
          orderId: order.id,
          method: TransactionMethod.PAYMENT,
          price: account.price,
          status: TransactionStatus.SUCCESS,
        },
      });

      return {
        message: 'Buy account success',
        buyer: {
          userId: updatedBuyer.id,
          balanceBefore: buyer.balance,
          balanceAfter: updatedBuyer.balance,
          balanceUpdatedAt: updatedBuyer.balanceUpdatedAt,
        },
        order,
        transaction,
        purchasedAccount: {
          id: account.id,
          categoryId: account.categoryId,
          username: account.username,
          email: account.email,
          password: account.password,
          rank: account.rank,
          level: account.level,
          images: account.images,
          description: account.description,
          soldPrice: account.price,
          status: GameAccountStatus.SOLD,
        },
      };
    });
  }

  async updateSellRequestStatus(
    id: string,
    status: SellRequestStatus,
    rejectReason?: string,
  ) {
    const request = await this.prisma.sellRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`SellRequest #${id} not found`);
    }

    if (request.status !== SellRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be processed');
    }

    if (status === SellRequestStatus.REJECTED && !rejectReason?.trim()) {
      throw new BadRequestException('reject reason is required');
    }

    return this.prisma.sellRequest.update({
      where: { id },
      data: {
        status,
        rejectReason:
          status === SellRequestStatus.REJECTED ? rejectReason?.trim() : null,
      },
    });
  }

  private parsePositiveInt(
    value: string | undefined,
    defaultValue: number,
  ): number {
    if (!value?.trim()) return defaultValue;

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      throw new BadRequestException('page and limit must be positive integers');
    }

    return parsed;
  }
}
