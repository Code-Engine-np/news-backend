import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { ArticleLike } from './article-like.entity';
import { ArticleView } from './article-view.entity';
import { Comment } from './comment.entity';
import { Media } from './media.entity';
import { NewsArticle } from './news-article.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshTokenHash?: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.VIEWER })
  role!: Role;

  @Column({ type: 'varchar', length: 150 })
  fullName!: string;

  @OneToMany(() => NewsArticle, (article) => article.author)
  articles?: NewsArticle[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments?: Comment[];

  @OneToMany(() => Media, (media) => media.uploader)
  uploadedMedia?: Media[];

  @OneToMany(() => ArticleView, (view) => view.user)
  articleViews?: ArticleView[];

  @OneToMany(() => ArticleLike, (like) => like.user)
  articleLikes?: ArticleLike[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
