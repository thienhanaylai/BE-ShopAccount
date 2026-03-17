import { TransactionStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
