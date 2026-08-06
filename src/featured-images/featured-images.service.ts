import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturedImage } from '@/entities/featured-image.entity';
import { CreateFeaturedImageDto } from './dto/create-featured-image.dto';
import { UpdateFeaturedImageDto } from './dto/update-featured-image.dto';

@Injectable()
export class FeaturedImagesService {
  constructor(
    @InjectRepository(FeaturedImage)
    private readonly repo: Repository<FeaturedImage>,
  ) {}

  private map(fi: FeaturedImage) {
    return {
      id: fi.id,
      imageUrl: fi.imageUrl,
      publicId: fi.publicId ?? null,
      caption: fi.caption ?? null,
      linkUrl: fi.linkUrl ?? null,
      order: fi.order,
      isActive: fi.isActive,
      createdAt: fi.createdAt,
      updatedAt: fi.updatedAt,
    };
  }

  async findActive() {
    const rows = await this.repo.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    return rows.map((r) => this.map(r));
  }

  async findAll() {
    const rows = await this.repo.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
    return rows.map((r) => this.map(r));
  }

  async findOne(id: string) {
    const fi = await this.repo.findOne({ where: { id } });
    if (!fi) throw new NotFoundException('Featured image not found');
    return this.map(fi);
  }

  async create(dto: CreateFeaturedImageDto) {
    const fi = this.repo.create(dto);
    return this.map(await this.repo.save(fi));
  }

  async update(id: string, dto: UpdateFeaturedImageDto) {
    const fi = await this.repo.findOne({ where: { id } });
    if (!fi) throw new NotFoundException('Featured image not found');
    Object.assign(fi, dto);
    return this.map(await this.repo.save(fi));
  }

  async remove(id: string) {
    const fi = await this.repo.findOne({ where: { id } });
    if (!fi) throw new NotFoundException('Featured image not found');
    await this.repo.remove(fi);
    return { deleted: true };
  }
}
