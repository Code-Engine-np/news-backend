import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscriptionsController } from './newsletter-subscriptions.controller';
import { NewsletterSubscriptionsService } from './newsletter-subscriptions.service';
import { NewsletterSubscription } from '../entities';
import { UsersModule } from 'src/users/users.module';

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
