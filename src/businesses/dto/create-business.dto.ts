import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ description: 'User ID who owns this business' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Business name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Business type (e.g., Full Service Car Wash)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Business description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Business address' })
  @IsString()
  @IsNotEmpty()
  business_address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'ZIP/Postal Code' })
  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @ApiProperty({ description: 'Business phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Business email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Business image URL', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  // @ApiProperty({ description: 'Location ID', required: false })
  // @IsUUID()
  // @IsOptional()
  // location_id?: string;

  @ApiProperty({ description: 'Business verification status', required: false })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;
}
