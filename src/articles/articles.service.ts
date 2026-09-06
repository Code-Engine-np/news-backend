import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Article } from '@/entities/article.entity';
import { Category } from '@/entities/category.entity';
import { Role } from '@/common/enums/role.enum';
import { CreateArticleDto } from '@/articles/dto/create-article.dto';
import { NewsStatus } from '@/common/enums/news-status.enum';
import { UsersService } from '@/users/users.service';
import { UpdateArticleDto } from '@/articles/dto/update-article.dto';
import slug from 'slug';
import { CategoriesService } from '@/categories/categories.service';
import { Image } from '@/entities';
import { PaginationQueryDto } from '@/articles/dto/pagination-query.dto';
import { ArticlesQueryDto } from '@/articles/dto/articles-query.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    private readonly usersService: UsersService,

    private readonly dataSource: DataSource,

    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(
    query: PaginationQueryDto = {},
  ): Promise<Article[] | PaginatedResult<Article>> {
    const baseOptions = {
      order: { createdAt: 'DESC' as const },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        status: true,
        category: true,
        author: { id: true, fullName: true },
        createdAt: true,
        updatedAt: true,
      },
      relations: ['category', 'author'],
    };

    if (query.page == null) {
      return this.articlesRepository.find(baseOptions);
    }

    const { page, limit = 10 } = query;
    const [data, total] = await this.articlesRepository.findAndCount({
      ...baseOptions,
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findPublished(
    query: ArticlesQueryDto = {},
  ): Promise<Article[] | PaginatedResult<Article>> {
    const where: Record<string, unknown> = { status: NewsStatus.PUBLISHED };
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    const baseOptions = {
      where,
      order: { createdAt: 'DESC' as const },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        author: { id: true, fullName: true },
        category: true,
      },
      relations: ['category', 'author', 'images'],
    };

    // No pagination params → return flat array (backward-compatible for home page)
    if (query.page == null && !query.categorySlug) {
      return this.articlesRepository.find(baseOptions);
    }

    const { page = 1, limit = 10 } = query;
    const [data, total] = await this.articlesRepository.findAndCount({
      ...baseOptions,
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const article = await this.articlesRepository.findOne({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        summary: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: ['category', 'author', 'images'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async findOneBySlug(slug: string) {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        summary: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          fullName: true,
        },
        category: true,
      },
      relations: ['category', 'author', 'images'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async create(createArticleDto: CreateArticleDto, authorId: string) {
    const author = await this.usersService.findById(authorId);
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    let category: Category | null = await this.categoriesRepository.findOne({
      where: { id: createArticleDto.categoryId },
    });
    if (!category) {
      // if the category does not exist, create a new one with the provided name
      const slugfied: string = slug(createArticleDto.category, {
        lower: true,
      });
      category = await this.categoriesService.create({
        slug: slugfied,
        name: createArticleDto.category,
      });
    }

    const slugifiedTitle = slug(createArticleDto.title, { lower: true });
    return this.dataSource.transaction(async (manager) => {
      const article = manager.create(Article, {
        title: createArticleDto.title,
        summary: createArticleDto.summary,
        content: createArticleDto.content,
        slug: slugifiedTitle,
        author,
        category,
        status: createArticleDto.status ?? NewsStatus.DRAFT,
      });
      const savedArticle = await manager.save(article);

      if (createArticleDto.images?.length) {
        const images = createArticleDto.images.map((img) =>
          manager.create(Image, {
            secureUrl: img.secure_url || null,
            publicId: img.public_id || null,
            resourceType: img.resource_type || null,
            youtubeUrl: img.youtube_url || null,
            altText: img.alt_text,
            caption: img.caption,
            article: savedArticle,
            articleId: savedArticle.id,
          }),
        );
        await manager.save(Image, images);
      }
      return manager.findOne(Article, {
        where: { id: savedArticle.id },
        relations: ['category', 'author', 'images'],
      });
    });
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    actor: { sub: string; role: Role },
  ) {
    const article = await this.findOne(id);

    const canManageAll = actor.role === Role.ADMIN;
    const isOwner = article.author.id === actor.sub;
    if (!canManageAll && !isOwner) {
      throw new ForbiddenException('You cannot edit this article');
    }

    const {
      categoryId,
      category: categoryName,
      images,
      ...articleData
    } = updateArticleDto;
    Object.assign(article, articleData);

    if (categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      article.category = category;
    } else if (categoryName) {
      const slugified = slug(categoryName, { lower: true });
      article.category = await this.categoriesService.create({
        slug: slugified,
        name: categoryName,
      });
    }

    return this.dataSource.transaction(async (manager) => {
      const savedArticle = await manager.save(Article, article);

      if (images) {
        await manager.delete(Image, { articleId: savedArticle.id });

        if (images.length) {
          const newImages = images.map((img) =>
            manager.create(Image, {
              secureUrl: img.secure_url || null,
              publicId: img.public_id || null,
              resourceType: img.resource_type || null,
              youtubeUrl: img.youtube_url || null,
              altText: img.alt_text,
              caption: img.caption,
              article: savedArticle,
              articleId: savedArticle.id,
            }),
          );
          await manager.save(Image, newImages);
        }
      }

      return manager.findOne(Article, {
        where: { id: savedArticle.id },
        relations: ['category', 'author', 'images'],
      });
    });
  }

  async remove(id: string, actor: { sub: string; role: Role }) {
    const article = await this.findOne(id);
    const canManageAll = actor.role === Role.ADMIN;
    const isOwner = article.author.id === actor.sub;

    if (!canManageAll && !isOwner) {
      throw new ForbiddenException('You cannot delete this article');
    }

    await this.articlesRepository.remove(article);
    return { deleted: true };
  }
}
