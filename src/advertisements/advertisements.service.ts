import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advertisement, AdPosition } from '@/entities/advertisement.entity';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@Injectable()
export class AdvertisementsService {
  constructor(
    @InjectRepository(Advertisement)
    private readonly repo: Repository<Advertisement>,
  ) {}

  private map(ad: Advertisement) {
    return {
      id: ad.id,
      title: ad.title,
      linkUrl: ad.linkUrl ?? null,
      imageUrl: ad.imageUrl,
      publicId: ad.publicId ?? null,
      position: ad.position,
      isActive: ad.isActive,
      order: ad.order,
      startDate: ad.startDate ?? null,
      endDate: ad.endDate ?? null,
      createdAt: ad.createdAt,
      updatedAt: ad.updatedAt,
    };
  }

  async findActive(position?: AdPosition) {
    const now = new Date();
    const ads = await this.repo.find({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      order: { order: 'ASC', createdAt: 'DESC' },
    });

    // filter by campaign dates in memory (simple, avoids complex OR queries)
    return ads
      .filter((ad) => !ad.startDate || ad.startDate <= now)
      .filter((ad) => !ad.endDate || ad.endDate >= now)
      .map((ad) => this.map(ad));
  }

  async findAll() {
    const ads = await this.repo.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
    return ads.map((ad) => this.map(ad));
  }

  async findOne(id: string) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Advertisement not found');
    return this.map(ad);
  }

  async create(dto: CreateAdvertisementDto) {
    const ad = this.repo.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return this.map(await this.repo.save(ad));
  }

  async update(id: string, dto: UpdateAdvertisementDto) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Advertisement not found');
    Object.assign(ad, {
      ...dto,
      startDate:
        dto.startDate !== undefined
          ? dto.startDate
            ? new Date(dto.startDate)
            : null
          : ad.startDate,
      endDate:
        dto.endDate !== undefined
          ? dto.endDate
            ? new Date(dto.endDate)
            : null
          : ad.endDate,
    });
    return this.map(await this.repo.save(ad));
  }

  async remove(id: string) {
    const ad = await this.repo.findOne({ where: { id } });
    if (!ad) throw new NotFoundException('Advertisement not found');
    await this.repo.remove(ad);
    return { deleted: true };
  }
}
