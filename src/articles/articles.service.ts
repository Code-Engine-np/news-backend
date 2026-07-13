import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NewsArticle } from '@/entities/news-article.entity';
import { Category } from '@/entities/category.entity';
import { Role } from '@/common/enums/role.enum';
import { CreateArticleDto } from '@/articles/dto/create-article.dto';
import { NewsStatus } from '@/common/enums/news-status.enum';
import { UsersService } from '@/users/users.service';
import { UpdateArticleDto } from '@/articles/dto/update-article.dto';
import slug from 'slug';
import { CategoriesService } from '@/categories/categories.service';
import { Image } from '@/entities';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly articlesRepository: Repository<NewsArticle>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    @InjectRepository(Image)
    // private readonly imagesRepository: Repository<Image>,
    private readonly usersService: UsersService,

    private readonly dataSource: DataSource,

    private readonly categoriesService: CategoriesService,
  ) {}

  findAll() {
    return this.articlesRepository.find({
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        author: {
          id: true,
          fullName: true,
        },
        createdAt: true,
        updatedAt: true,
      },
      relations: ['category', 'author'],
    });
  }

  findPublished() {
    return this.articlesRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          fullName: true,
        },
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const article = await this.articlesRepository.findOne({
      where: { id },
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
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          fullName: true,
        },
        category: true,
      },
      relations: ['category', 'author'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async create(createArticleDto: CreateArticleDto, authorId: string) {
    console.log(
      'Creating article with DTO:',
      createArticleDto,
      'and authorId:',
      authorId,
    );
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
        nameNe: createArticleDto.category,
      });
    }

    const slugifiedTitle = slug(createArticleDto.title, { lower: true });
    return this.dataSource.transaction(async (manager) => {
      const article = manager.create(NewsArticle, {
        ...createArticleDto,
        slug: slugifiedTitle,
        author,
        category,
        status: createArticleDto.status ?? NewsStatus.DRAFT,
        images: [],
      });
      const savedArticle = await manager.save(article);

      if (createArticleDto.images?.length) {
        const images = createArticleDto.images.map((img) =>
          manager.create(Image, {
            secureUrl: img.secure_url,
            publicId: img.public_id,
            resourceType: img.resource_type,
            altText: img.alt_text,
            article: savedArticle,
            articleId: savedArticle.id,
          }),
        );
        console.log('Saving images:', images);
        await manager.save(Image, images);
      }
      return manager.findOne(NewsArticle, {
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

    const { categoryId, ...articleData } = updateArticleDto;
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

    return this.articlesRepository.save(article);
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
