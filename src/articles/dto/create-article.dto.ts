import { CloudinaryImageDto } from '@/articles/dto/cloudinary-image.dto';
import { NewsStatus } from '@/common/enums/news-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform } from 'class-transformer';
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

  @Transform(
    ({ value }: { value: unknown }): CloudinaryImageDto[] | undefined => {
      if (value === undefined) {
        return undefined;
      }
      let raw: unknown = value;
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw) as unknown;
        } catch {
          raw = [];
        }
      }
      return plainToInstance(CloudinaryImageDto, raw as object[]);
    },
  )
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
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
