import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Unique URL slug for the category' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ description: 'Category name in English' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Category name in Nepali' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameNe?: string;

  @ApiPropertyOptional({ description: 'English description' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Nepali description' })
  @IsOptional()
  @IsString()
  descriptionNe?: string;
}
