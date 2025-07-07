import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;
}

export class AuthSuccessResponseDto {
  @ApiProperty({
    example: 'success',
    description: 'Status of the operation',
  })
  status: string;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    type: AuthTokensResponseDto,
    description: 'Authentication tokens',
    required: false,
  })
  data?: AuthTokensResponseDto;
}

export class UserProfileResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  last_name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'CUSTOMER',
    description: 'User role',
    enum: ['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'],
  })
  role: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user account is active',
  })
  is_active: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether the user email is verified',
  })
  is_email_verified: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'User creation date',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'User last update date',
  })
  updated_at: Date;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 'error',
    description: 'Status of the operation',
  })
  status: string;

  @ApiProperty({
    example: 'Invalid credentials',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 401,
    description: 'HTTP status code',
  })
  statusCode: number;
}
