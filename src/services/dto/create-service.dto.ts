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
import { ServiceCategory } from '../entities/service.entity';

export class CreateServiceDto {
  @IsUUID()
  provider_id: string;

  @IsOptional()
  @IsUUID()
  location_id?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(15)
  duration_minutes: number;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsUrl()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
