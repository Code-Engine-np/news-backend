import { NewsArticle } from '@/entities/news-article.entity';
import { Tag } from '@/entities/tag.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'article_tags' })
@Unique(['article', 'tag'])
export class ArticleTag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => NewsArticle, (article) => article.articleTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  article!: NewsArticle;

  @ManyToOne(() => Tag, (tag) => tag.articleTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  tag!: Tag;
}
