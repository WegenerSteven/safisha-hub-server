import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsPositive,
  IsEmail,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  booking_id: string;

  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  stripe_payment_id?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
export class CreateMpesaPaymentDto {
  @ApiProperty({ example: 1000, description: 'Amount to pay in KES' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: '254712345678',
    description: 'Mpesa phone number (format: 2547XXXXXXXX)',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Customer email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreateCardPaymentDto {
  @ApiProperty({ example: 1000, description: 'Amount to pay in KES' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Customer email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '4084084084084081', description: 'Card number' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: '123', description: 'Card CVV' })
  @IsString()
  @IsNotEmpty()
  cvv: string;

  @ApiProperty({ example: '12', description: 'Expiry month (MM)' })
  @IsString()
  @IsNotEmpty()
  expiry_month: string;

  @ApiProperty({ example: '29', description: 'Expiry year (YY)' })
  @IsString()
  @IsNotEmpty()
  expiry_year: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Card PIN (required for some countries)',
  })
  @IsString()
  @IsNotEmpty()
  pin?: string;
}