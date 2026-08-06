import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FeaturedImagesService } from './featured-images.service';
import { CreateFeaturedImageDto } from './dto/create-featured-image.dto';
import { UpdateFeaturedImageDto } from './dto/update-featured-image.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@ApiTags('featured-images')
@Controller('featured-images')
export class FeaturedImagesController {
  constructor(
    private readonly service: FeaturedImagesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /** Public: active images ordered by `order` */
  @Get()
  @ApiOperation({ summary: 'List active featured images' })
  @ApiOkResponse({ description: 'Returns active featured images.' })
  findActive() {
    return this.service.findActive();
  }

  /** Admin: all images regardless of status */
  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'List all featured images (admin)' })
  findAll() {
    return this.service.findAll();
  }

  /** Cloudinary upload signature for featured images */
  @Get('upload-signature')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get Cloudinary upload signature for featured images' })
  getUploadSignature() {
    return this.cloudinaryService.generateUploadSignature('Best_News_Assets/featured');
  }

  /** Cloudinary delete signature */
  @Get('delete-signature')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get Cloudinary delete signature' })
  getDeleteSignature(@Query('publicId') publicId: string) {
    return this.cloudinaryService.generateDeleteSignature(publicId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a featured image slide' })
  create(@Body() dto: CreateFeaturedImageDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update a featured image slide' })
  update(@Param('id') id: string, @Body() dto: UpdateFeaturedImageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a featured image slide' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
