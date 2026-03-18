import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateWalletsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  initialBalance?: number;
}
