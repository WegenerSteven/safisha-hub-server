import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RegisterCustomerDto } from '../users/dto/register-customer.dto';
import { RegisterServiceProviderDto } from '../users/dto/register-service-provider.dto';
import {
  AuthSuccessResponseDto,
  ErrorResponseDto,
  UserProfileResponseDto,
} from './dto/auth-response.dto';
import { Public } from './decorators/public.decorators';
import {
  GetCurrentUserId,
  GetRefreshToken,
} from './decorators/get-current-user.decorator';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email verification',
  })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully registered.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in user',
    description: 'Authenticate user and return access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully signed in.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or unverified email.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @UseGuards(AtGuard)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully signed out.',
  })
  async signOut(@GetCurrentUserId() userId: string) {
    return await this.authService.signOut(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access and refresh tokens using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token has been successfully refreshed.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. Invalid refresh token.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token expired or invalid.',
    type: ErrorResponseDto,
  })
  async refreshTokens(
    @GetCurrentUserId() userId: string,
    @GetRefreshToken() refreshToken: string,
  ) {
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Send a password reset link to the user email address',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset link has been sent.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User with this email not found.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format.',
    type: ErrorResponseDto,
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using a valid reset token',
  })
  @ApiResponse({
    status: 200,
    description: 'Password has been successfully reset.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
    type: ErrorResponseDto,
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.new_password,
    );
  }

  @UseGuards(AtGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired token.',
    type: ErrorResponseDto,
  })
  async getProfile(@GetCurrentUserId() userId: string) {
    return await this.authService.validateUser(userId);
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
  })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return await this.authService.resendVerificationEmail(
      resendVerificationDto.email,
    );
  }

  @Public()
  @Post('register/customer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new customer',
    description: 'Create a new customer account with email verification',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer has been successfully registered.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
    type: ErrorResponseDto,
  })
  async registerCustomer(@Body() registerDto: RegisterCustomerDto) {
    return await this.authService.registerCustomer(registerDto);
  }

  @Public()
  @Post('register/service-provider')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new service provider',
    description: 'Create a new service provider account with business details',
  })
  @ApiResponse({
    status: 201,
    description: 'Service provider has been successfully registered.',
    type: AuthSuccessResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
    type: ErrorResponseDto,
  })
  async registerServiceProvider(
    @Body() registerDto: RegisterServiceProviderDto,
  ) {
    return await this.authService.registerServiceProvider(registerDto);
  }
}
