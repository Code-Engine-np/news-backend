import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto implements Partial<CreateArticleDto> {
  categoryId?: string;
  slugEn?: string;
  slugNe?: string;
  titleEn?: string;
  titleNe?: string;
  summaryEn?: string;
  summaryNe?: string;
  contentEn?: string;
  contentNe?: string;
  status?: CreateArticleDto['status'];
}
