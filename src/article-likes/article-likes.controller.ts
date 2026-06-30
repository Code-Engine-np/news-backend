import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleLikesService } from './article-likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('article-likes')
@Controller('article-likes')
export class ArticleLikesController {
  constructor(private readonly articleLikesService: ArticleLikesService) {}

  @Get('article/:articleId')
  @ApiParam({ name: 'articleId', description: 'Article identifier' })
  @ApiOperation({ summary: 'List likes for an article' })
  @ApiOkResponse({ description: 'Returns likes for the article.' })
  findByArticle(@Param('articleId') articleId: string) {
    return this.articleLikesService.findByArticle(articleId);
  }

  @Post('article/:articleId')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'articleId', description: 'Article identifier' })
  @ApiOperation({ summary: 'Toggle like on an article' })
  @ApiOkResponse({ description: 'Returns like status.' })
  @UseGuards(JwtAuthGuard)
  toggle(
    @Param('articleId') articleId: string,
    @Req() request: { user: { id: string } },
  ) {
    return this.articleLikesService.toggle(articleId, request.user.id);
  }
}
