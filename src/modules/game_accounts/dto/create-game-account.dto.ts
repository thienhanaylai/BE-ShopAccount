import { GameAccountStatus } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toInt = (value: unknown): number => {
  if (typeof value === 'number') return value;
  return Number.parseInt(String(value), 10);
};

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

  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(0)
  price: number;

  @IsEnum(GameAccountStatus)
  @IsOptional()
  status?: GameAccountStatus;

  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(0)
  @IsOptional()
  level?: number;

  @IsString()
  @IsOptional()
  rank?: string;

  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}
