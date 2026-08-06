import { PartialType } from '@nestjs/swagger';
import { CreateFeaturedImageDto } from './create-featured-image.dto';

export class UpdateFeaturedImageDto extends PartialType(
  CreateFeaturedImageDto,
) {}
