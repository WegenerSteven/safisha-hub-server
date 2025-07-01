import {
  IsBoolean,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
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
  password: string;

  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
