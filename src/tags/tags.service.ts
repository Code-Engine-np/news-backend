import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  findAll() {
    return this.tagsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['articleTags'],
    });
  }

  async findOne(id: string) {
    const tag = await this.tagsRepository.findOne({
      where: { id },
      relations: ['articleTags'],
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async create(dto: CreateTagDto) {
    const existingBySlug = await this.tagsRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existingBySlug) {
      throw new ConflictException('Tag slug already exists');
    }

    const tag = this.tagsRepository.create(dto);
    return this.tagsRepository.save(tag);
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    return this.tagsRepository.save(tag);
  }

  async remove(id: string) {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
    return { deleted: true };
  }
}
