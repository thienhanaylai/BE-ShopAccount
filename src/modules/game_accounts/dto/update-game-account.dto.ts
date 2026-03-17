import { GameAccountStatus } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateGameAccountDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(GameAccountStatus)
  @IsOptional()
  status?: GameAccountStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  level?: number;

  @IsString()
  @IsOptional()
  rank?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}
