import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TagsController } from './tags.controller';
// import { TagsService } from './tags.service';
// import { Tag } from '../entities';
import { UsersModule } from '@/users/users.module';
import { Tag } from '@/entities';
import { TagsService } from '@/tags/tags.service';
import { TagsController } from '@/tags/tags.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
