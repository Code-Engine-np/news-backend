import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleViewsController } from './article-views.controller';
import { ArticleViewsService } from './article-views.service';
import { ArticleView, NewsArticle } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleView, NewsArticle]), JwtModule.register({})],
  controllers: [ArticleViewsController],
  providers: [ArticleViewsService],
  exports: [ArticleViewsService],
})
export class ArticleViewsModule {}
