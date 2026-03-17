import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportTicket } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSupportTicketDto): Promise<SupportTicket> {
    return this.prisma.supportTicket.create({
      data: { id: generateId(), ...dto },
    });
  }

  async findAll(): Promise<SupportTicket[]> {
    return this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
