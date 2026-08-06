import { Article } from '@/entities/article.entity';
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

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string | null;

  @ManyToOne(() => Category, (c) => c.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Category | null;

  @OneToMany(() => Article, (article) => article.category)
  articles?: Article[];

  @OneToMany(() => Category, (c) => c.parent)
  children?: Category[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
