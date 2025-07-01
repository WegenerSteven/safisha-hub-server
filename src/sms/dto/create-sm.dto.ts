import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SMSType, SMSStatus } from '../entities/sm.entity';

export class CreateSMSDto {
  @IsPhoneNumber('KE')
  phone_number: string;

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
