import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUrl,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceCategoryDto {
  @ApiProperty({
    description: 'Name of the service category',
    example: 'Exterior Car Wash',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the service category',
    example:
      'Complete exterior car washing services including wash, rinse, and dry',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({
    description: 'Icon name or class for UI display',
    example: 'car-wash-icon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Category image URL for marketing',
    example: 'https://example.com/category-images/exterior-wash.jpg',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({
    description: 'JSON string of common features for this category',
    example: '["Soap wash", "Rinse", "Dry", "Tire cleaning"]',
  })
  @IsOptional()
  @IsString()
  features?: string;
}
