import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import {
  ArticleTag,
  Category,
  Comment,
  Image,
  NewsArticle,
  Tag,
} from '@/entities';
import { UsersModule } from '@/users/users.module';
import { ArticlesController } from '@/articles/articles.controller';
import { ArticlesService } from '@/articles/articles.service';
import { CategoriesModule } from '@/categories/categories.module';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewsArticle,
      Category,
      Tag,
      ArticleTag,
      Comment,
      Image,
    ]),
    CategoriesModule,
    UsersModule,

    JwtModule.register({}),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, CloudinaryService],
})
export class ArticlesModule {}
