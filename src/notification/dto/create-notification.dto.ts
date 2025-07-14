import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  NotificationType,
  NotificationStatus,
} from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(2)
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  is_read?: boolean;
}
