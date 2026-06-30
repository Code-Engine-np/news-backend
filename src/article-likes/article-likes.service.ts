import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleLike, NewsArticle } from '../entities';

@Injectable()
export class ArticleLikesService {
  constructor(
    @InjectRepository(ArticleLike)
    private readonly articleLikesRepository: Repository<ArticleLike>,
    @InjectRepository(NewsArticle)
    private readonly articlesRepository: Repository<NewsArticle>,
  ) {}

  async findByArticle(articleId: string) {
    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.articleLikesRepository.find({
      where: { article: { id: articleId } },
      relations: ['user'],
    });
  }

  async toggle(articleId: string, userId: string) {
    const article = await this.articlesRepository.findOne({
      where: { id: articleId },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const existing = await this.articleLikesRepository.findOne({
      where: { article: { id: articleId }, user: { id: userId } },
      relations: ['article', 'user'],
    });

    if (existing) {
      await this.articleLikesRepository.remove(existing);
      return { liked: false };
    }

    const like = this.articleLikesRepository.create({
      article,
      user: { id: userId } as any,
    });
    await this.articleLikesRepository.save(like);
    return { liked: true };
  }
}
