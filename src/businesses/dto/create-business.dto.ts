import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsEmail,
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
  address: string;

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

  @ApiProperty({ description: 'Location ID', required: false })
  @IsUUID()
  @IsOptional()
  location_id?: string;

  @ApiProperty({
    description: 'Operating hours',
    required: false,
    example: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '19:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
  })
  @IsObject()
  @IsOptional()
  operating_hours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}
