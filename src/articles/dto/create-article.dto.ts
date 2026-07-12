import { CloudinaryImageDto } from '@/articles/dto/cloudinary-image.dto';
import { NewsStatus } from '@/common/enums/news-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateArticleDto {
  @ApiPropertyOptional({
    description: 'Category identifier for the article ',
  })
  @IsOptional()
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({ description: 'Category name for the article' })
  @IsOptional()
  @IsString()
  category!: string;

  @ApiProperty({ description: 'Nepali title for the article' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Nepali summary for the article' })
  @IsString()
  summary!: string;

  @ApiProperty({ description: 'Nepali article content' })
  @IsString()
  content!: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value; // already an array when sent as JSON body
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CloudinaryImageDto)
  images!: CloudinaryImageDto[];

  @ApiPropertyOptional({ enum: NewsStatus, description: 'Publication status' })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional({
    description: 'Tag IDs to attach to the article',
    isArray: true,
    type: 'string',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}
