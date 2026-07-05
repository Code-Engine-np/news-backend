import { CommentsController } from '@/comments/comments.controller';
import { CommentsService } from '@/comments/comments.service';
import { Comment, NewsArticle } from '@/entities';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, NewsArticle]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
