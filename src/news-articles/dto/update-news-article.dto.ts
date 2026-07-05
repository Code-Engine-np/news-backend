import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NewsStatus } from '../../common/enums/news-status.enum';

export class UpdateNewsArticleDto {
  @ApiPropertyOptional({ description: 'Category ID for the article' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'English slug for the article' })
  @IsOptional()
  @IsString()
  slugEn?: string;

  @ApiPropertyOptional({ description: 'Nepali slug for the article' })
  @IsOptional()
  @IsString()
  slugNe?: string;

  @ApiPropertyOptional({ description: 'English title for the article' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: 'Nepali title for the article' })
  @IsOptional()
  @IsString()
  titleNe?: string;

  @ApiPropertyOptional({ description: 'English summary for the article' })
  @IsOptional()
  @IsString()
  summaryEn?: string;

  @ApiPropertyOptional({ description: 'Nepali summary for the article' })
  @IsOptional()
  @IsString()
  summaryNe?: string;

  @ApiPropertyOptional({ description: 'English article content' })
  @IsOptional()
  @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: 'Nepali article content' })
  @IsOptional()
  @IsString()
  contentNe?: string;

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
