import { Injectable, NotFoundException } from '@nestjs/common';
import { SellRequest } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';
import { UpdateSellRequestDto } from './dto/update-sell-request.dto';

@Injectable()
export class SellRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSellRequestDto): Promise<SellRequest> {
    return this.prisma.sellRequest.create({
      data: { id: generateId(), ...dto },
    });
  }

  async findAll(): Promise<SellRequest[]> {
    return this.prisma.sellRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<SellRequest> {
    const item = await this.prisma.sellRequest.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`SellRequest #${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateSellRequestDto): Promise<SellRequest> {
    await this.findOne(id);
    return this.prisma.sellRequest.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.sellRequest.delete({ where: { id } });
  }
}
