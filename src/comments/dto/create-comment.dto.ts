import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Article ID the comment belongs to' })
  @IsUUID()
  articleId!: string;

  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @MinLength(1)
  content!: string;
}
