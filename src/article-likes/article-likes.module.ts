import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleLikesController } from './article-likes.controller';
import { ArticleLikesService } from './article-likes.service';
import { ArticleLike, NewsArticle } from '../entities';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleLike, NewsArticle]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [ArticleLikesController],
  providers: [ArticleLikesService],
  exports: [ArticleLikesService],
})
export class ArticleLikesModule {}
