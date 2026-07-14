import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  private mapCategoryToApi(category: Category) {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name || '',
      description: category.description || '',
    };
  }

  private async getCategoryEntity(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findAll() {
    const categories = await this.categoriesRepository.find({
      order: { createdAt: 'DESC' },
    });
    return categories.map((c) => this.mapCategoryToApi(c));
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.mapCategoryToApi(category);
  }

  async findOne(id: string) {
    const category = await this.getCategoryEntity(id);
    return this.mapCategoryToApi(category);
  }

  async create(dto: CreateCategoryDto) {
    const existingBySlug = await this.categoriesRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existingBySlug) {
      throw new ConflictException('Category slug already exists');
    }

    const category = this.categoriesRepository.create(dto);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.getCategoryEntity(id);

    if (dto.slug && dto.slug !== category.slug) {
      const existingBySlug = await this.categoriesRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictException('Category slug already exists');
      }
    }

    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.getCategoryEntity(id);
    await this.categoriesRepository.remove(category);
    return { deleted: true };
  }
}
