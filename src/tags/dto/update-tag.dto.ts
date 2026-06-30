import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({ description: 'Unique URL slug for the tag' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @ApiPropertyOptional({ description: 'Tag name in English' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Tag name in Nepali' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameNe?: string;
}
