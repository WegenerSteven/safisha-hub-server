import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'User first name', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'User email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateCustomerProfileDto {
  @ApiProperty({ description: 'Customer address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Date of birth', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ description: 'Preferred contact method', required: false })
  @IsOptional()
  @IsString()
  preferred_contact_method?: string;

  @ApiProperty({
    description: 'Email notifications preference',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @ApiProperty({ description: 'SMS notifications preference', required: false })
  @IsOptional()
  @IsBoolean()
  sms_notifications?: boolean;
}

export class UpdateServiceProviderProfileDto {
  @ApiProperty({ description: 'Business name', required: false })
  @IsOptional()
  @IsString()
  business_name?: string;

  @ApiProperty({ description: 'Business description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Business address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Business phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
