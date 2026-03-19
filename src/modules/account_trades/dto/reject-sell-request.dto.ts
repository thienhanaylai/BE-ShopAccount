import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectSellRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
