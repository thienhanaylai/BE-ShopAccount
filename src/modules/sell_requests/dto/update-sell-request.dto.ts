import { SellRequestStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSellRequestDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  accountUsername?: string;

  @IsString()
  @IsOptional()
  accountPassword?: string;

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
