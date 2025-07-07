import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsEnum,
  IsBoolean,
  Min,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '../enums/service.enums';
import { PricingTier } from '../enums/service.enums';

export class CreateServicePricingDto {
  @ApiProperty({
    description: 'Service ID this pricing belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  service_id: string;

  @ApiProperty({
    description: 'Vehicle type for this pricing',
    enum: VehicleType,
    example: VehicleType.SEDAN,
  })
  @IsEnum(VehicleType)
  vehicle_type: VehicleType;

  @ApiProperty({
    description: 'Pricing tier',
    enum: PricingTier,
    example: PricingTier.STANDARD,
  })
  @IsEnum(PricingTier)
  pricing_tier: PricingTier;

  @ApiProperty({
    description: 'Price in KES',
    example: 1500,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Discounted price in KES',
    example: 1200,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  discount_price?: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    example: 60,
    minimum: 15,
  })
  @IsNumber()
  @Min(15)
  estimated_duration: number;

  @ApiPropertyOptional({
    description: 'Whether this pricing is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Special notes for this pricing',
    example: 'Additional charge for oversized vehicles',
  })
  @IsOptional()
  @IsString()
  special_notes?: string;
}
