import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ArticlesService } from '@/articles/articles.service';
import { CreateArticleDto } from '@/articles/dto/create-article.dto';
import { UpdateArticleDto } from '@/articles/dto/update-article.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Role } from '@/common/enums/role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('published')
  @ApiOperation({ summary: 'List published articles' })
  @ApiOkResponse({ description: 'Returns published articles.' })
  findPublished() {
    return this.articlesService.findPublished();
  }

  @Get('upload-signature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Cloudinary upload signature' })
  @ApiOkResponse({ description: 'Returns Cloudinary upload signature.' })
  getUploadSignature() {
    return this.cloudinaryService.generateUploadSignature(
      'Best_News_Assets/articles',
    );
  }

  @Get('delete-signature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Cloudinary delete signature' })
  @ApiOkResponse({ description: 'Returns Cloudinary delete signature.' })
  @Roles(Role.ADMIN, Role.EDITOR)
  getDeleteSignature(@Query('publicId') publicId: string) {
    return this.cloudinaryService.generateDeleteSignature(publicId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all articles for editors and admins' })
  @ApiOkResponse({ description: 'Returns all articles.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Article identifier' })
  @ApiOperation({ summary: 'Get a single article by id' })
  @ApiOkResponse({ description: 'Returns the requested article.' })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiOperation({ summary: 'Get a single article by slug' })
  @ApiOkResponse({ description: 'Returns the requested article.' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.articlesService.findOneBySlug(slug);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiCreatedResponse({ description: 'Returns the created article.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Req() request: { user: { sub: string } },
  ) {
    return this.articlesService.create(createArticleDto, request.user.sub);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Article identifier' })
  @ApiOperation({ summary: 'Update an article' })
  @ApiOkResponse({ description: 'Returns the updated article.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() request: { user: { sub: string; role: Role } },
  ) {
    return this.articlesService.update(id, updateArticleDto, request.user);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Article identifier' })
  @ApiOperation({ summary: 'Delete an article' })
  @ApiOkResponse({ description: 'Returns a deletion result.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  remove(
    @Param('id') id: string,
    @Req() request: { user: { sub: string; role: Role } },
  ) {
    return this.articlesService.remove(id, request.user);
  }
}
