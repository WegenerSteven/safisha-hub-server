import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsPhoneNumber,
  MaxLength,
  MinLength,
  IsNumber,
} from 'class-validator';
import { SMSType, SMSStatus } from '../entities/sms.entity';

export class CreateSMSDto {
  @IsPhoneNumber('KE')
  @IsNumber()
  phone_number: number;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  message: string;

  @IsEnum(SMSType)
  type: SMSType;

  @IsOptional()
  @IsEnum(SMSStatus)
  status?: SMSStatus;

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
