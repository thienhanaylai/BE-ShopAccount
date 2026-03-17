import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.prisma.order.create({ data: { id: generateId(), ...dto } });
  }

  async findAll(): Promise<Order[]> {
    return this.prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<Order> {
    const item = await this.prisma.order.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Order #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.order.delete({ where: { id } });
  }
}
