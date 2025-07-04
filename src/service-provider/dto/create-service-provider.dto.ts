import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateServiceProviderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  business_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @MinLength(10)
  address: string;

  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;
}
