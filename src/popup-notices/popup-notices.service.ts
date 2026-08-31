import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PopupNotice } from '@/entities/popup-notice.entity';
import { CreatePopupNoticeDto } from './dto/create-popup-notice.dto';
import { UpdatePopupNoticeDto } from './dto/update-popup-notice.dto';

@Injectable()
export class PopupNoticesService {
  constructor(
    @InjectRepository(PopupNotice)
    private readonly repo: Repository<PopupNotice>,
  ) {}

  private map(n: PopupNotice) {
    return {
      id: n.id,
      title: n.title,
      content: n.content,
      buttonText: n.buttonText,
      isActive: n.isActive,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    };
  }

  /** Public: returns the most recently created active notice, or null */
  async findActive() {
    const notice = await this.repo.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    return notice ? this.map(notice) : null;
  }

  async findAll() {
    const notices = await this.repo.find({ order: { createdAt: 'DESC' } });
    return notices.map((n) => this.map(n));
  }

  async findOne(id: string) {
    const notice = await this.repo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException('Popup notice not found');
    return this.map(notice);
  }

  async create(dto: CreatePopupNoticeDto) {
    const notice = this.repo.create({
      ...dto,
      buttonText: dto.buttonText ?? 'I Understand',
      isActive: dto.isActive ?? true,
    });
    return this.map(await this.repo.save(notice));
  }

  async update(id: string, dto: UpdatePopupNoticeDto) {
    const notice = await this.repo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException('Popup notice not found');
    Object.assign(notice, dto);
    return this.map(await this.repo.save(notice));
  }

  async remove(id: string) {
    const notice = await this.repo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException('Popup notice not found');
    await this.repo.remove(notice);
    return { deleted: true };
  }
}
