import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticlesController } from '@/news-articles/news-articles.controller';
import { NewsArticlesService } from '@/news-articles/news-articles.service';
import { NewsArticle, Category, Tag, ArticleTag } from '@/entities';
import { UsersModule } from '@/users/users.module';

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
