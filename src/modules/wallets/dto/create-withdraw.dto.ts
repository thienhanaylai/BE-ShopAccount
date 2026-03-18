import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateWithdrawDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  accountName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;
}
