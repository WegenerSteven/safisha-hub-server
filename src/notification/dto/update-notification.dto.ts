import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDate } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsOptional()
  @IsDate()
  read_at?: Date;
}
