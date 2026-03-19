import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SupportTicketStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { AdminReplySupportTicketDto } from './dto/admin-reply-support-ticket.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { QuerySupportTicketsDto } from './dto/query-support-tickets.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

export type SupportTicketDetail = Prisma.SupportTicketGetPayload<{
  include: {
    user: { select: { id: true; username: true; email: true } };
    handler: { select: { id: true; username: true; email: true } };
    replies: {
      include: {
        admin: { select: { id: true; username: true; email: true } };
      };
      orderBy: { createdAt: 'asc' };
    };
  };
}>;

@Injectable()
export class SupportTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateSupportTicketDto,
  ): Promise<SupportTicketDetail> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    const created = await this.prisma.supportTicket.create({
      data: {
        id: generateId(),
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        status: dto.status ?? SupportTicketStatus.PENDING,
      },
    });

    return this.findOne(created.id, userId, UserRole.CUSTOMER);
  }

  async findAll(
    requesterId: string,
    requesterRole: UserRole,
    query: QuerySupportTicketsDto,
  ): Promise<{
    data: SupportTicketDetail[];
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

    const where: Prisma.SupportTicketWhereInput = {};

    if (requesterRole !== UserRole.ADMIN) {
      where.userId = requesterId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (requesterRole === UserRole.ADMIN && query.handledBy) {
      where.handledBy = query.handledBy;
    }

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    if (query.search?.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        {
          replies: {
            some: {
              message: { contains: keyword, mode: 'insensitive' },
            },
          },
        },
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
        include: {
          user: { select: { id: true, username: true, email: true } },
          handler: { select: { id: true, username: true, email: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              admin: { select: { id: true, username: true, email: true } },
            },
          },
        },
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

  async findOne(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<SupportTicketDetail> {
    const item = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true } },
        handler: { select: { id: true, username: true, email: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            admin: { select: { id: true, username: true, email: true } },
          },
        },
      },
    });

    if (!item) throw new NotFoundException(`SupportTicket #${id} not found`);

    if (requesterRole !== UserRole.ADMIN && item.userId !== requesterId) {
      throw new ForbiddenException('You can only view your own tickets');
    }

    return item;
  }

  async update(
    id: string,
    dto: UpdateSupportTicketDto,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<SupportTicketDetail> {
    const current = await this.findOne(id, requesterId, requesterRole);

    if (requesterRole !== UserRole.ADMIN && dto.status !== undefined) {
      throw new ForbiddenException(
        'Users cannot update ticket status directly',
      );
    }

    if (dto.status === SupportTicketStatus.PENDING) {
      throw new BadRequestException('Cannot move ticket back to PENDING');
    }

    await this.prisma.supportTicket.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        status: requesterRole === UserRole.ADMIN ? dto.status : undefined,
        resolvedAt:
          requesterRole === UserRole.ADMIN &&
          (dto.status === SupportTicketStatus.RESOLVED ||
            dto.status === SupportTicketStatus.REJECTED)
            ? new Date()
            : undefined,
        handledBy:
          requesterRole === UserRole.ADMIN && current.handledBy === null
            ? requesterId
            : undefined,
        handledAt:
          requesterRole === UserRole.ADMIN && current.handledAt === null
            ? new Date()
            : undefined,
      },
    });

    return this.findOne(id, requesterId, requesterRole);
  }

  async startProcessing(
    id: string,
    adminId: string,
  ): Promise<SupportTicketDetail> {
    const item = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`SupportTicket #${id} not found`);

    if (
      item.status === SupportTicketStatus.RESOLVED ||
      item.status === SupportTicketStatus.REJECTED
    ) {
      throw new BadRequestException('Closed ticket cannot be processed');
    }

    await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: SupportTicketStatus.IN_PROGRESS,
        handledBy: item.handledBy ?? adminId,
        handledAt: item.handledAt ?? new Date(),
      },
    });

    return this.findOne(id, adminId, UserRole.ADMIN);
  }

  async reply(
    id: string,
    adminId: string,
    dto: AdminReplySupportTicketDto,
  ): Promise<SupportTicketDetail> {
    if (dto.status === SupportTicketStatus.PENDING) {
      throw new BadRequestException('Reply status cannot be PENDING');
    }

    await this.prisma.$transaction(async (tx) => {
      const item = await tx.supportTicket.findUnique({ where: { id } });
      if (!item) throw new NotFoundException(`SupportTicket #${id} not found`);

      const nextStatus =
        dto.status ??
        (item.status === SupportTicketStatus.PENDING
          ? SupportTicketStatus.IN_PROGRESS
          : item.status);

      await tx.supportTicketReply.create({
        data: {
          id: generateId(),
          ticketId: id,
          adminId,
          message: dto.message.trim(),
        },
      });

      await tx.supportTicket.update({
        where: { id },
        data: {
          status: nextStatus,
          handledBy: item.handledBy ?? adminId,
          handledAt: item.handledAt ?? new Date(),
          resolvedAt:
            nextStatus === SupportTicketStatus.RESOLVED ||
            nextStatus === SupportTicketStatus.REJECTED
              ? new Date()
              : null,
        },
      });
    });

    return this.findOne(id, adminId, UserRole.ADMIN);
  }

  async remove(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    await this.findOne(id, requesterId, requesterRole);
    await this.prisma.supportTicket.delete({ where: { id } });
  }
}
