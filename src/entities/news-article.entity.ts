import { NewsStatus } from '@/common/enums/news-status.enum';
import { ArticleLike } from '@/entities/article-like.entity';
import { ArticleTag } from '@/entities/article-tag.entity';
import { ArticleView } from '@/entities/article-view.entity';
import { Category } from '@/entities/category.entity';
import { Comment } from '@/entities/comment.entity';
import { Media } from '@/entities/media.entity';
import { User } from '@/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @ManyToOne(() => Category, (category) => category.articles, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(() => ArticleTag, (articleTag) => articleTag.article)
  articleTags?: ArticleTag[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments?: Comment[];

  @OneToMany(() => Media, (media) => media.article)
  media?: Media[];

  @OneToMany(() => ArticleView, (view) => view.article)
  views?: ArticleView[];

  @OneToMany(() => ArticleLike, (like) => like.article)
  likes?: ArticleLike[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
