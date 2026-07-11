import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import {
  ArticleLike,
  ArticleTag,
  ArticleView,
  Category,
  Comment,
  Media,
  NewsArticle,
  Tag,
} from '@/entities';
import { UsersModule } from '@/users/users.module';
import { ArticlesController } from '@/articles/articles.controller';
import { ArticlesService } from '@/articles/articles.service';
import { CategoriesModule } from '@/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewsArticle,
      Category,
      Tag,
      ArticleTag,
      Comment,
      Media,
      ArticleView,
      ArticleLike,
    ]),
    CategoriesModule,
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
