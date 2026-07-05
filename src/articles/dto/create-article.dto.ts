import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { NewsStatus } from '../../common/enums/news-status.enum';

export class CreateArticleDto {
  @ApiProperty({ description: 'Category identifier for the article' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ description: 'English slug for the article' })
  @IsString()
  @MinLength(3)
  slugEn!: string;

  @ApiProperty({ description: 'Nepali slug for the article' })
  @IsString()
  @MinLength(3)
  slugNe!: string;

  @ApiProperty({ description: 'English title for the article' })
  @IsString()
  titleEn!: string;

  @ApiProperty({ description: 'Nepali title for the article' })
  @IsString()
  titleNe!: string;

  @ApiProperty({ description: 'English summary for the article' })
  @IsString()
  summaryEn!: string;

  @ApiProperty({ description: 'Nepali summary for the article' })
  @IsString()
  summaryNe!: string;

  @ApiProperty({ description: 'English article content' })
  @IsString()
  contentEn!: string;

  @ApiProperty({ description: 'Nepali article content' })
  @IsString()
  contentNe!: string;

  @ApiPropertyOptional({ enum: NewsStatus, description: 'Publication status' })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;

  @ApiPropertyOptional({ description: 'Tag IDs to attach to the article', isArray: true, type: 'string' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  tagIds?: string[];
}
