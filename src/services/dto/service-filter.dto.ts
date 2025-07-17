import { Transform } from 'class-transformer';
// ...existing imports...
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ServiceStatus,
  ServiceType,
  VehicleType,
} from '../enums/service.enums';

export class ServiceFilterDto {
  @ApiPropertyOptional({
    description: 'Search term for service name or description',
    example: 'car wash',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by business ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  business_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by service provider ID (deprecated, use business_id)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  provider_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by location ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  location_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by service status',
    enum: ServiceStatus,
    example: ServiceStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({
    description: 'Filter by service type',
    enum: ServiceType,
    example: ServiceType.PREMIUM,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  service_type?: ServiceType;

  @ApiPropertyOptional({
    description: 'Filter by vehicle type',
    enum: VehicleType,
    example: VehicleType.SEDAN,
  })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicle_type?: VehicleType;

  @ApiPropertyOptional({
    description: 'Filter by availability status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_available?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 500,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 5000,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'created_at',
    enum: [
      'name',
      'base_price',
      'created_at',
      'average_rating',
      'booking_count',
    ],
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}
