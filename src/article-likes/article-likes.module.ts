import { ArticleLikesController } from '@/article-likes/article-likes.controller';
import { ArticleLikesService } from '@/article-likes/article-likes.service';
import { ArticleLike, NewsArticle } from '@/entities';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

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
