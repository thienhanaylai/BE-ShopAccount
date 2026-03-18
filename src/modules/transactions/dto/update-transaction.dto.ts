import { TransactionMethod, TransactionStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsEnum(TransactionMethod)
  @IsOptional()
  method?: TransactionMethod;

  @ValidateIf(
    (o: UpdateTransactionDto) => o.method === TransactionMethod.TRANSFER,
  )
  @IsString()
  @IsOptional()
  recipientUserId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}
