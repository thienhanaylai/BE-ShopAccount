import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateWebsiteSettingsDto {
  @IsString()
  @MaxLength(120)
  @IsOptional()
  siteName?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  siteDescription?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  contactPhone?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  commissionRate?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minWithdraw?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  withdrawFee?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  viettelDiscount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  vinaphoneDiscount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  mobifoneDiscount?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  vietnamobileDiscount?: number;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  orderNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  depositNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  requireEmailVerification?: boolean;

  @IsBoolean()
  @IsOptional()
  requirePhoneVerification?: boolean;

  @IsBoolean()
  @IsOptional()
  twoFactorAuth?: boolean;

  @IsBoolean()
  @IsOptional()
  maintenanceMode?: boolean;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  maintenanceMessage?: string;
}
