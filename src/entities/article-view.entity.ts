import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { User } from './user.entity';

@Entity({ name: 'article_views' })
export class ArticleView {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => NewsArticle, (article) => article.views, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  article!: NewsArticle;

  @ManyToOne(() => User, (user) => user.articleViews, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  user?: User | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sessionId?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  @CreateDateColumn()
  viewedAt!: Date;
}
