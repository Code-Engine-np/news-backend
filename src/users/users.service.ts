import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../common/security/password-hash.util';
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const seedAdminEmail = this.configService.get<string>('SEED_ADMIN_EMAIL');
    const seedAdminPassword = this.configService.get<string>(
      'SEED_ADMIN_PASSWORD',
    );

    if (!seedAdminEmail || !seedAdminPassword) {
      return;
    }

    const existingAdmin = await this.findByEmail(seedAdminEmail);
    if (existingAdmin) {
      return;
    }

    await this.create({
      email: seedAdminEmail,
      password: seedAdminPassword,
      fullName: 'Seed Admin',
      role: Role.ADMIN,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = hashPassword(createUserDto.password);
    const user = this.usersRepository.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      fullName: createUserDto.fullName,
      role: createUserDto.role ?? Role.VIEWER,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }
}
