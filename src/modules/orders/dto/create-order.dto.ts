import { OrderStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  gameAccountId: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
