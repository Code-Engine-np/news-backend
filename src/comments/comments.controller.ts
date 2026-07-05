import {
  Body,
  Controller,
  Get,
  Param,
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
import { CommentsService } from '@/comments/comments.service';
import { CreateCommentDto } from '@/comments/dto/create-comment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('article/:articleId')
  @ApiParam({ name: 'articleId', description: 'Article identifier' })
  @ApiOperation({ summary: 'List comments for an article' })
  @ApiOkResponse({ description: 'Returns comments for the article.' })
  findByArticle(@Param('articleId') articleId: string) {
    return this.commentsService.findByArticle(articleId);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a comment on an article' })
  @ApiCreatedResponse({ description: 'Returns the created comment.' })
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateCommentDto,
    @Req() request: { user: { id: string } },
  ) {
    return this.commentsService.create(dto, request.user.id);
  }
}
