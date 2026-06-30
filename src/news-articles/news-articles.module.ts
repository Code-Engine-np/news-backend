import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticlesController } from './news-articles.controller';
import { NewsArticlesService } from './news-articles.service';
import { UsersModule } from '../users/users.module';
import { ArticleTag, Category, NewsArticle, Tag } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsArticle, Category, Tag, ArticleTag]),
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [NewsArticlesController],
  providers: [NewsArticlesService],
  exports: [NewsArticlesService],
})
export class NewsArticlesModule {}
