import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  ArticleLike,
  ArticleTag,
  ArticleView,
  Category,
  Comment,
  Media,
  NewsArticle,
  NewsletterSubscription,
  Tag,
  User,
} from './entities';
import { NewsArticlesModule } from './news-articles/news-articles.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';
import { ArticleViewsModule } from './article-views/article-views.module';
import { ArticleLikesModule } from './article-likes/article-likes.module';
import { NewsletterSubscriptionsModule } from './newsletter-subscriptions/newsletter-subscriptions.module';
import { ArticlesModule } from '@/articles/articles.module';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { configuration } from '@/common/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USER', 'news_user'),
        password: configService.get<string>('DB_PASSWORD', 'news_password'),
        database: configService.get<string>('DB_NAME', 'news_db'),
        entities: [
          User,
          Category,
          Tag,
          ArticleTag,
          Comment,
          Media,
          ArticleView,
          ArticleLike,
          NewsletterSubscription,
          NewsArticle,
        ],
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        migrations: ['dist/database/migrations/*.js'],
      }),
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
    NewsArticlesModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    ArticleViewsModule,
    ArticleLikesModule,
    NewsletterSubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
