import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class ArticlesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
