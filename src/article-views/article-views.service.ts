import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { ArticleView, NewsArticle } from '../entities';

@Injectable()
export class ArticleViewsService {
  constructor(
    @InjectRepository(ArticleView)
    private readonly articleViewsRepository: Repository<ArticleView>,
    @InjectRepository(NewsArticle)
    private readonly articlesRepository: Repository<NewsArticle>,
  ) {}

  async record(articleId: string, request: Request, userId?: string) {
    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const view = this.articleViewsRepository.create({
      article,
      ipAddress: request.ip ?? undefined,
      userAgent: request.headers['user-agent'] ?? undefined,
      sessionId: undefined,
      user: userId ? ({ id: userId } as any) : undefined,
    });

    return this.articleViewsRepository.save(view);
  }
}
