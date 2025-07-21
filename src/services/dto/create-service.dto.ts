import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  // isBoolean,
  IsBoolean,
} from 'class-validator';
import {
  ServiceStatus,
  ServiceType,
  VehicleType,
} from '../enums/service.enums';
// import { Column } from 'typeorm/decorator/columns/Column';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
  @IsUUID('4', { message: 'business_id must be a valid UUID v4' })
  business_id: string;

  @IsUUID('4', { message: 'category_id must be a valid UUID' })
  category_id: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsEnum(ServiceType)
  service_type: ServiceType;

  @ApiProperty({ required: false })
  @IsEnum(VehicleType)
  vehicle_type: VehicleType;

  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @ApiProperty({ required: false })
  @IsNumber()
  base_price: number;

  @Transform(({ value }) => (value ? parseInt(value, 10) : null))
  @ApiProperty({ required: false })
  @IsNumber()
  duration_minutes: number;

  @IsOptional()
  @ApiProperty({ enum: ServiceStatus, required: false })
  @IsEnum(ServiceStatus)
  @IsOptional()
  status: ServiceStatus;

  @IsOptional()
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  // @IsOptional()
  // @Column({ type: 'integer', default: 0 })
  // booking_count: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
