import { SellRequestStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSellRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  accountUsername: string;

  @IsString()
  @IsNotEmpty()
  accountPassword: string;

  @IsEnum(SellRequestStatus)
  @IsOptional()
  status?: SellRequestStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  rejectReason?: string;
}
