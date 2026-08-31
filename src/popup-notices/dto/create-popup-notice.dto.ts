import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePopupNoticeDto {
  @ApiProperty({ description: 'Popup title shown as heading' })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @ApiProperty({ description: 'Body text (plain text, newlines preserved)' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({ default: 'I Understand', description: 'Dismiss button label' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buttonText?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
