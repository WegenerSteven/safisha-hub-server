import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsIn,
  IsDecimal,
  IsInt,
  Min,
} from 'class-validator';

export class CreateCustomerDto {
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

  @IsOptional()
  @IsInt()
  @Min(0)
  total_bookings?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  total_spent?: number;

  @IsOptional()
  @IsString()
  @IsIn(['bronze', 'silver', 'gold', 'platinum'])
  loyalty_tier?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  loyalty_points?: number;
}
