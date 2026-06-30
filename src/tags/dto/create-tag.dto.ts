import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Unique URL slug for the tag' })
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ description: 'Tag name in English' })
  @IsString()
  @MinLength(1)
  nameEn!: string;

  @ApiProperty({ description: 'Tag name in Nepali' })
  @IsString()
  @MinLength(1)
  nameNe!: string;
}
