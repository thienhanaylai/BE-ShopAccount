import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadImageDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  folder?: string;
}
