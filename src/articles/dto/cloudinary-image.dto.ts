import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CloudinaryImageDto {
  @IsString()
  @IsOptional()
  secure_url?: string;

  @IsString()
  @IsOptional()
  public_id?: string;

  @IsString()
  @IsOptional()
  resource_type?: string;

  @IsUrl()
  @IsOptional()
  youtube_url?: string;

  @IsString()
  @IsOptional()
  alt_text?: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
