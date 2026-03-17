import { TransactionStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
