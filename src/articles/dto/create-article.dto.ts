import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { NewsStatus } from '../../common/enums/news-status.enum';

export class CreateArticleDto {
  @IsString()
  categoryId!: string;

  @IsString()
  @MinLength(3)
  slugEn!: string;

  @IsString()
  @MinLength(3)
  slugNe!: string;

  @IsString()
  titleEn!: string;

  @IsString()
  titleNe!: string;

  @IsString()
  summaryEn!: string;

  @IsString()
  summaryNe!: string;

  @IsString()
  contentEn!: string;

  @IsString()
  contentNe!: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
