import { Article } from '@/entities/article.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { NewsArticle } from './article.entity';

@Entity({ name: 'images' })
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  secureUrl!: string;

  @Column({ type: 'varchar', length: 500 })
  publicId!: string;

  @Column({ type: 'varchar', length: 100 })
  resourceType!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  altText?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  caption?: string | null;

  @ManyToOne(() => Article, (article) => article.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId' })
  article!: Article;

  @Column({ name: 'article_id' })
  articleId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
