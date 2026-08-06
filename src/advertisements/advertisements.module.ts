import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advertisement } from '@/entities/advertisement.entity';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@/users/users.module';
import { AdvertisementsController } from '@/advertisements/advertisements.controller';
import { AdvertisementsService } from '@/advertisements/advertisements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Advertisement]),
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService, CloudinaryService],
})
export class AdvertisementsModule {}
