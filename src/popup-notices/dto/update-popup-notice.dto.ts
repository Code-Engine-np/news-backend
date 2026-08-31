import { PartialType } from '@nestjs/swagger';
import { CreatePopupNoticeDto } from './create-popup-notice.dto';

export class UpdatePopupNoticeDto extends PartialType(CreatePopupNoticeDto) {}
