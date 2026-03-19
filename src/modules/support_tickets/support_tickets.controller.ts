import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SupportTicketsService } from './support_tickets.service';
import type { SupportTicketDetail } from './support_tickets.service';
import { AdminReplySupportTicketDto } from './dto/admin-reply-support-ticket.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { QuerySupportTicketsDto } from './dto/query-support-tickets.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(private readonly service: SupportTicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSupportTicketDto,
  ): Promise<SupportTicketDetail> {
    return this.service.create(userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
    @Query() query: QuerySupportTicketsDto,
  ): Promise<{
    data: SupportTicketDetail[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.service.findAll(requesterId, requesterRole, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
    @Param('id') id: string,
  ): Promise<SupportTicketDetail> {
    return this.service.findOne(id, requesterId, requesterRole);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketDto,
  ): Promise<SupportTicketDetail> {
    return this.service.update(id, dto, requesterId, requesterRole);
  }

  @Post(':id/start-processing')
  @HttpCode(HttpStatus.OK)
  startProcessing(
    @CurrentUser('sub') adminId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
  ): Promise<SupportTicketDetail> {
    this.ensureAdminRole(role);

    const adminActions = this.service as unknown as {
      startProcessing: (
        ticketId: string,
        handledByAdminId: string,
      ) => Promise<SupportTicketDetail>;
    };

    return adminActions.startProcessing(id, adminId);
  }

  @Post(':id/reply')
  @HttpCode(HttpStatus.OK)
  adminReply(
    @CurrentUser('sub') adminId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
    @Body() dto: AdminReplySupportTicketDto,
  ): Promise<SupportTicketDetail> {
    this.ensureAdminRole(role);

    const adminActions = this.service as unknown as {
      reply: (
        ticketId: string,
        replyAdminId: string,
        payload: AdminReplySupportTicketDto,
      ) => Promise<SupportTicketDetail>;
    };

    return adminActions.reply(id, adminId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser('sub') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
    @Param('id') id: string,
  ) {
    return this.service.remove(id, requesterId, requesterRole);
  }

  private ensureAdminRole(role: UserRole): void {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin role required');
    }
  }
}
