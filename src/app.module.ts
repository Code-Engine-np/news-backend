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
import { NewsletterSubscriptionsModule } from '@/newsletter-subscriptions/newsletter-subscriptions.module';
import { AdvertisementsModule } from '@/advertisements/advertisements.module';
import { FeaturedImagesModule } from '@/featured-images/featured-images.module';
import {
  Category,
  Image,
  Article,
  NewsletterSubscription,
  User,
  Advertisement,
  FeaturedImage,
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
          Image,
          NewsletterSubscription,
          Article,
          Advertisement,
          FeaturedImage,
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    NewsletterSubscriptionsModule,
    AdvertisementsModule,
    FeaturedImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
