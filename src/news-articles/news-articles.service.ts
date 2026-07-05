import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { ArticleTag, Category, NewsArticle, Tag } from '../entities';
import { UsersService } from '../users/users.service';
import { NewsStatus } from '../common/enums/news-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class NewsArticlesService {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsArticlesRepository: Repository<NewsArticle>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(ArticleTag)
    private readonly articleTagsRepository: Repository<ArticleTag>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.newsArticlesRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['author', 'category', 'articleTags', 'articleTags.tag'],
    });
  }

  findPublished() {
    return this.newsArticlesRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      relations: ['author', 'category', 'articleTags', 'articleTags.tag'],
    });
  }

  async findOne(id: string) {
    const article = await this.newsArticlesRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'articleTags', 'articleTags.tag', 'comments', 'likes', 'views'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async create(dto: CreateNewsArticleDto, authorId: string) {
    const author = await this.usersService.findById(authorId);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { tagIds, ...articleData } = dto;

    const article = this.newsArticlesRepository.create({
      ...articleData,
      category,
      author,
      status: dto.status ?? NewsStatus.DRAFT,
    });

    const saved = await this.newsArticlesRepository.save(article);

    if (tagIds && tagIds.length > 0) {
      await this.attachTags(saved, tagIds);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateNewsArticleDto, actor: { id: string; role: Role }) {
    const article = await this.findOne(id);

    const canManageAll = actor.role === Role.ADMIN;
    const isOwner = article.author.id === actor.id;
    if (!canManageAll && !isOwner) {
      throw new ForbiddenException('You cannot edit this article');
    }

    const { tagIds, categoryId, ...articleData } = dto;
    Object.assign(article, articleData);

    if (categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      article.category = category;
    }

    await this.newsArticlesRepository.save(article);

    if (tagIds !== undefined) {
      await this.articleTagsRepository.delete({ article: { id } });
      if (tagIds.length > 0) {
        await this.attachTags(article, tagIds);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, actor: { id: string; role: Role }) {
    const article = await this.findOne(id);
    const canManageAll = actor.role === Role.ADMIN;
    const isOwner = article.author.id === actor.id;

    if (!canManageAll && !isOwner) {
      throw new ForbiddenException('You cannot delete this article');
    }

    await this.newsArticlesRepository.remove(article);
    return { deleted: true };
  }

  private async attachTags(article: NewsArticle, tagIds: string[]) {
    const tags = await this.tagsRepository.findByIds(tagIds);
    const articleTags = tags.map((tag) =>
      this.articleTagsRepository.create({ article, tag }),
    );
    await this.articleTagsRepository.save(articleTags);
  }
}
