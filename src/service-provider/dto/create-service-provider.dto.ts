import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceProviderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'SafariHub',
    description: 'Name of the business or service provider',
  })
  business_name: string;

  @ApiProperty()
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
