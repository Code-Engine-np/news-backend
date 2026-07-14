import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Unique URL slug for the category' })
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;
}
