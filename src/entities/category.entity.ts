import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NewsArticle } from './news-article.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'varchar', length: 160 })
  nameEn!: string;

  @Column({ type: 'varchar', length: 160 })
  nameNe!: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn?: string | null;

  @Column({ type: 'text', nullable: true })
  descriptionNe?: string | null;

  @OneToMany(() => NewsArticle, (article) => article.category)
  articles?: NewsArticle[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
