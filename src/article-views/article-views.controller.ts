import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleViewsService } from './article-views.service';

@ApiTags('article-views')
@Controller('article-views')
export class ArticleViewsController {
  constructor(private readonly articleViewsService: ArticleViewsService) {}

  @Post('article/:articleId')
  @ApiParam({ name: 'articleId', description: 'Article identifier' })
  @ApiOperation({ summary: 'Record a view for an article' })
  @ApiCreatedResponse({ description: 'View recorded.' })
  record(
    @Param('articleId') articleId: string,
    @Req() request: Request,
  ) {
    return this.articleViewsService.record(articleId, request);
  }
}
