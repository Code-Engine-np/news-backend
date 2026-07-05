import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  findAll() {
    return this.categoriesRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['articles'],
    });
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
      relations: ['articles'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['articles'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
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
    const category = await this.findOne(id);

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
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { deleted: true };
  }
}
