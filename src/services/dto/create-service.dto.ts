import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUrl,
  MaxLength,
  MinLength,
  Min,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ServiceStatus,
  ServiceType,
  VehicleType,
} from '../enums/service.enums';

export class CreateServiceDto {
  @ApiProperty({
    description: 'ID of the service provider',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  business_id: string;

  @ApiProperty({
    description: 'Service category ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  category_id: string;

  @ApiPropertyOptional({
    description: 'Location ID where the service is available',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  location_id?: string;

  @ApiProperty({
    description: 'Name of the car wash service',
    example: 'Premium Car Wash',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the service',
    example:
      'Professional car wash service with premium cleaning products and interior detailing',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Short description for quick display',
    example: 'Premium wash with interior cleaning',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  short_description?: string;

  @ApiProperty({
    description: 'Type of service',
    enum: ServiceType,
    example: ServiceType.PREMIUM,
  })
  @IsEnum(ServiceType)
  service_type: ServiceType;

  @ApiProperty({
    description: 'Vehicle type this service is for',
    enum: VehicleType,
    example: VehicleType.SEDAN,
  })
  @IsEnum(VehicleType)
  vehicle_type: VehicleType;

  @ApiProperty({
    description: 'Base price of the service in KES',
    example: 1500,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  base_price: number;

  @ApiPropertyOptional({
    description: 'Discounted price in KES',
    example: 1200,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  discounted_price?: number;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 60,
    minimum: 15,
  })
  @IsNumber()
  @Min(15)
  duration_minutes: number;

  @ApiPropertyOptional({
    description: 'Service status',
    enum: ServiceStatus,
    example: ServiceStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @ApiPropertyOptional({
    description: 'List of service features',
    example: ['Exterior wash', 'Interior cleaning', 'Wax application'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({
    description: 'Special requirements or preparation needed',
    example: ['Remove personal items', 'Fuel tank should be accessible'],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({
    description: 'Array of service image URLs',
    example: [
      'https://example.com/service1.jpg',
      'https://example.com/service2.jpg',
    ],
    isArray: true,
    type: String,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Main service image URL',
    example: 'https://example.com/images/service.jpg',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Whether the service is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the service is available for booking',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
