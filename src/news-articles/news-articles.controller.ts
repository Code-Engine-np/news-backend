import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CreateNewsArticleDto } from '@/news-articles/dto/create-news-article.dto';
import { UpdateNewsArticleDto } from '@/news-articles/dto/update-news-article.dto';
import { NewsArticlesService } from '@/news-articles/news-articles.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('news-articles')
@Controller('news-articles')
export class NewsArticlesController {
  constructor(private readonly newsArticlesService: NewsArticlesService) {}

  @Get('published')
  @ApiOperation({ summary: 'List published news articles' })
  @ApiOkResponse({ description: 'Returns published articles.' })
  findPublished() {
    return this.newsArticlesService.findPublished();
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all news articles (admin/editor)' })
  @ApiOkResponse({ description: 'Returns all articles.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  findAll() {
    return this.newsArticlesService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Article identifier' })
  @ApiOperation({ summary: 'Get a single news article by id' })
  @ApiOkResponse({ description: 'Returns the requested article.' })
  findOne(@Param('id') id: string) {
    return this.newsArticlesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new news article' })
  @ApiCreatedResponse({ description: 'Returns the created article.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  create(
    @Body() dto: CreateNewsArticleDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.newsArticlesService.create(dto, request.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Article identifier' })
  @ApiOperation({ summary: 'Update a news article' })
  @ApiOkResponse({ description: 'Returns the updated article.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsArticleDto,
    @Req() request: { user: { id: string; role: Role } },
  ) {
    return this.newsArticlesService.update(id, dto, request.user);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Article identifier' })
  @ApiOperation({ summary: 'Delete a news article' })
  @ApiOkResponse({ description: 'Returns a deletion result.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  remove(
    @Param('id') id: string,
    @Req() request: { user: { id: string; role: Role } },
  ) {
    return this.newsArticlesService.remove(id, request.user);
  }
}
