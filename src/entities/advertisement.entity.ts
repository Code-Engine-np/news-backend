import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdPosition {
  BANNER = 'banner',
  SIDEBAR = 'sidebar',
  INLINE = 'inline',
}

@Entity({ name: 'advertisements' })
export class Advertisement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkUrl?: string | null;

  @Column({ type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  publicId?: string | null;

  @Column({ type: 'enum', enum: AdPosition, default: AdPosition.BANNER })
  position!: AdPosition;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
