import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PopupNoticesService } from './popup-notices.service';
import { CreatePopupNoticeDto } from './dto/create-popup-notice.dto';
import { UpdatePopupNoticeDto } from './dto/update-popup-notice.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';

@ApiTags('popup-notices')
@Controller('popup-notices')
export class PopupNoticesController {
  constructor(private readonly service: PopupNoticesService) {}

  /** Public: returns the single active notice (or null) */
  @Get('active')
  @ApiOperation({ summary: 'Get the active popup notice' })
  @ApiOkResponse({ description: 'Active popup notice or null' })
  findActive() {
    return this.service.findActive();
  }

  /** Admin: all notices */
  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'List all popup notices (admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get a single popup notice' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Create a popup notice' })
  create(@Body() dto: CreatePopupNoticeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update a popup notice' })
  update(@Param('id') id: string, @Body() dto: UpdatePopupNoticeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a popup notice' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
