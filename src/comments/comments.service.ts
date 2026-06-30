import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, NewsArticle } from '../entities';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
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

    return this.commentsRepository.find({
      where: { article: { id: articleId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateCommentDto, userId: string) {
    const article = await this.articlesRepository.findOne({
      where: { id: dto.articleId },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = this.commentsRepository.create({
      content: dto.content,
      article,
      user: { id: userId } as any,
    });

    return this.commentsRepository.save(comment);
  }
}
