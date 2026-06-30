import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Unique URL slug for the category' })
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ description: 'Category name in English' })
  @IsString()
  @MinLength(1)
  nameEn!: string;

  @ApiProperty({ description: 'Category name in Nepali' })
  @IsString()
  @MinLength(1)
  nameNe!: string;

  @ApiPropertyOptional({ description: 'English description' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Nepali description' })
  @IsOptional()
  @IsString()
  descriptionNe?: string;
}
