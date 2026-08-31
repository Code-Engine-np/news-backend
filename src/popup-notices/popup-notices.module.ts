import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PopupNotice } from '@/entities/popup-notice.entity';
import { UsersModule } from '@/users/users.module';
import { PopupNoticesController } from './popup-notices.controller';
import { PopupNoticesService } from './popup-notices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PopupNotice]),
    UsersModule,
    JwtModule.register({}),
  ],
  controllers: [PopupNoticesController],
  providers: [PopupNoticesService],
})
export class PopupNoticesModule {}
