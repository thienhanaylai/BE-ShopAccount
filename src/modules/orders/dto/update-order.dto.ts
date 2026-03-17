import { OrderStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  gameAccountId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
