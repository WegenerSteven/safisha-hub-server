import {
  IsBoolean,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../entities/user.entity';

// Role-specific registration data
export class CustomerRegistrationData {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  @IsIn(['email', 'sms', 'phone'])
  preferred_contact_method?: string;

  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  sms_notifications?: boolean;
}

export class ServiceProviderRegistrationData {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  business_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;
}

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerRegistrationData)
  customer_data?: CustomerRegistrationData;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceProviderRegistrationData)
  provider_data?: ServiceProviderRegistrationData;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
