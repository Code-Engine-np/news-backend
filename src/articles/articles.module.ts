import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { UsersModule } from '../users/users.module';
import {
  ArticleLike,
  ArticleTag,
  ArticleView,
  Category,
  Comment,
  Media,
  NewsArticle,
  Tag,
} from '../entities';
import { JwtModule } from '@nestjs/jwt';

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
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
