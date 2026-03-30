import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { generateId } from '../../common/utils/nanoid.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const data: Prisma.UserCreateInput = {
      id: generateId(),
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash: await this.hashPassword(createUserDto.password),
      phone: createUserDto.phone,
      role: UserRole.CUSTOMER,
    };

    return this.prisma.user.create({ data });
  }

  async findAll(query: QueryUsersDto): Promise<{
    data: User[];
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

    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search?.trim()) {
      const keyword = query.search.trim();
      where.OR = [
        { username: { contains: keyword, mode: 'insensitive' } },
        { email: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
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

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username: updateUserDto.username,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        role: updateUserDto.role,
        status: updateUserDto.status,
        passwordHash: updateUserDto.password
          ? await this.hashPassword(updateUserDto.password)
          : undefined,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async updateByAdmin(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        phone: dto.phone,
        role: dto.role,
        status: dto.status,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
