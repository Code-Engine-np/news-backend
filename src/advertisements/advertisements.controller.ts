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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';
import { AdPosition } from '@/entities/advertisement.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@ApiTags('advertisements')
@Controller('advertisements')
export class AdvertisementsController {
  constructor(
    private readonly service: AdvertisementsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /** Public: active ads, optionally filtered by position */
  @Get()
  @ApiOperation({ summary: 'List active advertisements' })
  @ApiQuery({ name: 'position', enum: AdPosition, required: false })
  @ApiOkResponse({ description: 'Returns active advertisements.' })
  findActive(@Query('position') position?: AdPosition) {
    return this.service.findActive(position);
  }

  /** Admin: all ads regardless of status */
  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'List all advertisements (admin)' })
  findAll() {
    return this.service.findAll();
  }

  /** Admin: Cloudinary upload signature */
  @Get('upload-signature')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get Cloudinary upload signature for ad images' })
  getUploadSignature() {
    return this.cloudinaryService.generateUploadSignature('Best_News_Assets/advertisements');
  }

  /** Admin: Cloudinary delete signature */
  @Get('delete-signature')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get Cloudinary delete signature for ad images' })
  getDeleteSignature(@Query('publicId') publicId: string) {
    return this.cloudinaryService.generateDeleteSignature(publicId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get a single advertisement' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create an advertisement' })
  create(@Body() dto: CreateAdvertisementDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update an advertisement' })
  update(@Param('id') id: string, @Body() dto: UpdateAdvertisementDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an advertisement' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
