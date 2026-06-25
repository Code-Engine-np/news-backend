import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { User } from './user.entity';

@Entity({ name: 'media' })
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  altText?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  caption?: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @ManyToOne(() => NewsArticle, (article) => article.media, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  article!: NewsArticle;

  @ManyToOne(() => User, (user) => user.uploadedMedia, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  uploader?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
