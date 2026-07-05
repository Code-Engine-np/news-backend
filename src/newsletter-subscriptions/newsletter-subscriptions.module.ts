import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@/users/users.module';
import { NewsletterSubscription } from '@/entities';
import { NewsletterSubscriptionsController } from '@/newsletter-subscriptions/newsletter-subscriptions.controller';
import { NewsletterSubscriptionsService } from '@/newsletter-subscriptions/newsletter-subscriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscription]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [NewsletterSubscriptionsController],
  providers: [NewsletterSubscriptionsService],
  exports: [NewsletterSubscriptionsService],
})
export class NewsletterSubscriptionsModule {}
