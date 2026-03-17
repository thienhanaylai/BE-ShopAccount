import { GameAccountStatus } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGameAccountDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @Min(0)
  price: number;

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
