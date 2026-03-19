import { IsNotEmpty, IsString } from 'class-validator';

export class GetImageDto {
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
