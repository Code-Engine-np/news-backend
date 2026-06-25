import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'newsletter_subscriptions' })
export class NewsletterSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  fullName?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  unsubscribedAt?: Date | null;

  @CreateDateColumn()
  subscribedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
