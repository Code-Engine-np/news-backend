import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { User } from './user.entity';

@Entity({ name: 'article_likes' })
@Unique(['article', 'user'])
export class ArticleLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => NewsArticle, (article) => article.likes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  article!: NewsArticle;

  @ManyToOne(() => User, (user) => user.articleLikes, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
