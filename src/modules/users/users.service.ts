import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
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

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

  async remove(id: string): Promise<void> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
