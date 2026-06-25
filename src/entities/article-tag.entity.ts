import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { NewsArticle } from './news-article.entity';
import { Tag } from './tag.entity';

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
