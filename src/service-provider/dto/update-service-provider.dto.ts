import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceProviderDto } from './create-service-provider.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class UpdateServiceProviderDto extends PartialType(
  CreateServiceProviderDto,
) {
  @ApiProperty({
    description: 'Business name',
    required: false,
  })
  @IsOptional()
  @IsString()
  business_name?: string;

  @ApiProperty({
    description: 'Business Description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Business Address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Business Phone Number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('KE')
  phone?: string;

  @ApiProperty({
    description: 'Business Rating',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({
    description: 'Business Verification Status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
