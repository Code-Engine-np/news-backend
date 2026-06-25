import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { NewsArticle } from './news-article.entity';
import { UsersService } from '../users/users.service';
import { NewsStatus } from '../common/enums/news-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly articlesRepository: Repository<NewsArticle>,
    private readonly usersService: UsersService,
  ) {}

  findAll() {
    return this.articlesRepository.find({ order: { createdAt: 'DESC' } });
  }

  findPublished() {
    return this.articlesRepository.find({
      where: { status: NewsStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const article = await this.articlesRepository.findOne({ where: { id } });
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

    const article = this.articlesRepository.create({
      ...createArticleDto,
      author,
      status: createArticleDto.status ?? NewsStatus.DRAFT,
    });

    return this.articlesRepository.save(article);
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    actor: { id: string; role: Role },
  ) {
    const article = await this.findOne(id);

    const canManageAll = actor.role === Role.ADMIN;
    const isOwner = article.author.id === actor.id;
    if (!canManageAll && !isOwner) {
      throw new ForbiddenException('You cannot edit this article');
    }

    Object.assign(article, updateArticleDto);
    return this.articlesRepository.save(article);
  }

  async remove(id: string, actor: { id: string; role: Role }) {
    const article = await this.findOne(id);
    const canManageAll = actor.role === Role.ADMIN;
    const isOwner = article.author.id === actor.id;

    if (!canManageAll && !isOwner) {
      throw new ForbiddenException('You cannot delete this article');
    }

    await this.articlesRepository.remove(article);
    return { deleted: true };
  }
}
