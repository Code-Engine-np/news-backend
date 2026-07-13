import { NewsStatus } from '@/common/enums/news-status.enum';
import { Category } from '@/entities/category.entity';
import { Image } from '@/entities/image.entity';
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
  slug!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'enum', enum: NewsStatus, default: NewsStatus.DRAFT })
  status!: NewsStatus;

  @ManyToOne(() => User, (author) => author.articles, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  author!: User;

  @ManyToOne(() => Category, (category) => category.articles, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(() => Image, (image) => image.article, {
    cascade: true, // saving article also saves images
    eager: false,
  })
  images!: Image[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
