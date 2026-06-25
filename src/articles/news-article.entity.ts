import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { NewsStatus } from '../common/enums/news-status.enum';

@Entity({ name: 'news_articles' })
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220 })
  slugEn!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220 })
  slugNe!: string;

  @Column({ type: 'varchar', length: 255 })
  titleEn!: string;

  @Column({ type: 'varchar', length: 255 })
  titleNe!: string;

  @Column({ type: 'text' })
  summaryEn!: string;

  @Column({ type: 'text' })
  summaryNe!: string;

  @Column({ type: 'text' })
  contentEn!: string;

  @Column({ type: 'text' })
  contentNe!: string;

  @Column({ type: 'enum', enum: NewsStatus, default: NewsStatus.DRAFT })
  status!: NewsStatus;

  @ManyToOne(() => User, (author) => author.articles, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
