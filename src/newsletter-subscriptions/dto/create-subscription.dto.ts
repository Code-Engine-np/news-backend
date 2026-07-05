import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Subscriber email address' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Subscriber full name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;
}
