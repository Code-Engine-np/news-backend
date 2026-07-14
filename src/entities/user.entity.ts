import { Role } from '@/common/enums/role.enum';
import { Article } from '@/entities/article.entity';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Exclude()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId?: string | null;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshTokenHash?: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.VIEWER })
  role!: Role;

  @Column({ type: 'varchar', length: 150 })
  fullName!: string;

  @OneToMany(() => Article, (article) => article.author)
  articles?: Article[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
