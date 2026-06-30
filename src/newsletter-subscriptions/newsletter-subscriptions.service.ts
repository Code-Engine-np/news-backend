import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscription } from '../entities';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class NewsletterSubscriptionsService {
  constructor(
    @InjectRepository(NewsletterSubscription)
    private readonly subsRepository: Repository<NewsletterSubscription>,
  ) {}

  findAll() {
    return this.subsRepository.find({
      order: { subscribedAt: 'DESC' },
    });
  }

  async create(dto: CreateSubscriptionDto) {
    const existing = await this.subsRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unsubscribedAt = null;
        return this.subsRepository.save(existing);
      }
      return existing;
    }

    const subscription = this.subsRepository.create({
      email: dto.email.toLowerCase(),
      fullName: dto.fullName ?? null,
      isActive: true,
    });

    return this.subsRepository.save(subscription);
  }

  async unsubscribe(email: string) {
    const subscription = await this.subsRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!subscription) {
      throw new NotFoundException('Subscriber not found');
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();

    return this.subsRepository.save(subscription);
  }
}
