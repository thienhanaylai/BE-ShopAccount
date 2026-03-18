import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  message?: string;
}
