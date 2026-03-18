import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateWalletsDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  balance?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
