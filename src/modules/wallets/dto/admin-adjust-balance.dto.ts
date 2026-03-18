import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { BalanceAdjustDirection } from './wallet.enums';

export class AdminAdjustBalanceDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;

  @IsEnum(BalanceAdjustDirection)
  direction: BalanceAdjustDirection;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
