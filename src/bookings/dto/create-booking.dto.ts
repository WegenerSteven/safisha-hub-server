import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsArray,
  ValidateNested,
  IsPositive,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';

export class BookingAddOnDto {
  @IsUUID()
  addon_id: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;
}

export class CreateBookingDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  service_id: string;

  @IsDateString()
  service_date: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'service_time must be in HH:MM format',
  })
  service_time: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total_amount: number;

  @IsOptional()
  @IsString()
  special_instructions?: string;

  @IsOptional()
  @IsObject()
  vehicle_info?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingAddOnDto)
  booking_addons?: BookingAddOnDto[];
}
