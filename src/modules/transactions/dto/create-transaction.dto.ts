import { TransactionMethod, TransactionStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsEnum(TransactionMethod)
  method: TransactionMethod;

  @ValidateIf(
    (o: CreateTransactionDto) => o.method === TransactionMethod.TRANSFER,
  )
  @IsString()
  @IsNotEmpty()
  recipientUserId?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
