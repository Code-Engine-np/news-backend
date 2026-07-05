import { ApiProperty } from '@nestjs/swagger';

export class GoogleProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;
}
