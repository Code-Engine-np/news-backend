import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { FeaturedImage } from '@/entities/featured-image.entity';
import { FeaturedImagesService } from './featured-images.service';
import { FeaturedImagesController } from './featured-images.controller';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeaturedImage]),
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [FeaturedImagesController],
  providers: [FeaturedImagesService, CloudinaryService],
})
export class FeaturedImagesModule {}
