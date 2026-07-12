import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CloudinaryImageDto {
  @IsString()
  @IsNotEmpty()
  secure_url!: string;

  @IsString()
  @IsNotEmpty()
  public_id!: string;

  @IsString()
  @IsNotEmpty()
  resource_type!: string;

  @IsString()
  @IsOptional()
  alt_text?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
