import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmailType, EmailStatus } from '../entities/email-service.entity';

export class CreateEmailServiceDto {
  @IsEmail()
  to_email: string;

  @IsOptional()
  @IsEmail()
  from_email?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  subject: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsString()
  html_body?: string;

  @IsEnum(EmailType)
  type: EmailType;

  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  booking_id?: string;

  @IsOptional()
  @IsString()
  external_id?: string;
}
