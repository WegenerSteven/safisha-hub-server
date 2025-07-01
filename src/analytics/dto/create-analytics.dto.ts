import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsObject,
  IsIP,
  MaxLength,
} from 'class-validator';
import { AnalyticsType } from '../entities/analytics.entity';

export class CreateAnalyticsDto {
  @IsEnum(AnalyticsType)
  event_type: AnalyticsType;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  service_id?: string;

  @IsOptional()
  @IsUUID()
  booking_id?: string;

  @IsOptional()
  @IsObject()
  event_data?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  session_id?: string;

  @IsOptional()
  @IsIP()
  ip_address?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referrer?: string;
}
