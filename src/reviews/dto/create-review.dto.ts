import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  booking_id: string;

  @IsUUID()
  user_id: string;

  @IsUUID()
  service_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
