import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class BuyAccountDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  expectedPrice?: number;
}
