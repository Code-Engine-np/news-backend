import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '@/articles/articles.module';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { configuration } from '@/common/config/app.config';
import { AppConfig } from '@/common/interfaces/env.interface';
// import { NewsArticlesModule } from '@/news-articles/news-articles.module';
import { CategoriesModule } from '@/categories/categories.module';
import { TagsModule } from '@/tags/tags.module';
import { CommentsModule } from '@/comments/comments.module';
import { NewsletterSubscriptionsModule } from '@/newsletter-subscriptions/newsletter-subscriptions.module';
import {
  ArticleTag,
  Category,
  Comment,
  Image,
  NewsArticle,
  NewsletterSubscription,
  Tag,
  User,
} from '@/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL', { infer: true }),
        ssl: {
          rejectUnauthorized: false,
        },
        synchronize: configService.get('DB_SYNCHRONIZE', {
          infer: true,
        }),
        logging: configService.get('DB_LOGGING', { infer: true }),
        retryAttempts: 3,
        entities: [
          User,
          Category,
          Tag,
          ArticleTag,
          Comment,
          Image,
          NewsletterSubscription,
          NewsArticle,
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
    // NewsArticlesModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    NewsletterSubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
