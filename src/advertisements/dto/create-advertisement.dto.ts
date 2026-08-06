import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
} from 'class-validator';
import { AdPosition } from '@/entities/advertisement.entity';

export class CreateAdvertisementDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ description: 'Cloudinary secure URL of the ad image' })
  @IsUrl()
  imageUrl!: string;

  @ApiPropertyOptional({ description: 'Cloudinary public_id for deletion' })
  @IsOptional()
  @IsString()
  publicId?: string;

  @ApiPropertyOptional({ enum: AdPosition, default: AdPosition.BANNER })
  @IsOptional()
  @IsEnum(AdPosition)
  position?: AdPosition;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
