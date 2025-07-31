import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { RegisterCustomerDto } from '../users/dto/register-customer.dto';
import { RegisterServiceProviderDto } from '../users/dto/register-service-provider.dto';
import {
  PasswordResetPayload,
  EmailVerificationPayload,
} from './types/jwt.types';
import { EmailService } from '../email/email-service.service';
import { BusinessesService } from '../businesses/businesses.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
    private emailService: EmailService,
    private businessesService: BusinessesService,
  ) {}

  // Helper method to generate access and refresh tokens
  private async getTokens(userId: string, email: string, role: Role) {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRATION',
          '15m',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Method to hash data
  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
  }

  // Method to save refresh token
  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ) {
    const hashedRefreshToken = refreshToken
      ? await this.hashData(refreshToken)
      : null;
    await this.userRepository.update(userId, {
      hashedRefreshToken: hashedRefreshToken || undefined,
    });
  }

  // Sign up new user
  async signUp(signUpDto: SignUpDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Use database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash password
      const hashedPassword = await this.hashData(signUpDto.password);

      // Create new user
      const user = this.userRepository.create({
        first_name: signUpDto.first_name,
        last_name: signUpDto.last_name,
        email: signUpDto.email,
        password: hashedPassword,
        phone: signUpDto.phone,
        role: signUpDto.role,
        is_active: true,
        email_verified_at: undefined,
      });

      const savedUser = await this.userRepository.save(user);

      // Generate tokens
      const tokens = await this.getTokens(
        savedUser.id,
        savedUser.email,
        savedUser.role,
      );

      // Save refresh token
      await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

      // Remove password from response

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, hashedRefreshToken, ...userResponse } = savedUser;

      return {
        user: userResponse,
        tokens,
        message: 'User registered successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Sign in user
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Find user by email with password
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'is_active',
        'first_name',
        'last_name',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Check if email is verified
    // if (!user.email_verified_at) {
    //   throw new UnauthorizedException(
    //     'Verify your email before signing in. Check your email',
    //   );
    // }

    // Check if user is active
    if (!user.is_active) {
      throw new ForbiddenException('Account is deactivated');
    }
    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken); // Save refresh token

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userResponse } = user;
    return {
      user: userResponse,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'User signed in successfully',
    };
  }

  // Sign out user
  async signOut(userId: string) {
    await this.updateRefreshToken(userId, null);
    return { message: 'Successfully signed out' };
  }

  // Refresh tokens
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'role', 'hashedRefreshToken', 'is_active'],
    });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Access denied');
    }

    if (!user.is_active) {
      throw new ForbiddenException('Account is deactivated');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      tokens,
      message: 'Tokens refreshed successfully',
    };
  }

  // Validate user by ID (for guards)
  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
      select: [
        'id',
        'email',
        'role',
        'first_name',
        'last_name',
        'is_active',
        'phone',
        'address',
        'avatar',
        'email_verified_at',
        'created_at',
        'updated_at',
        // Add any other fields you need
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Forgot password
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If email exists, password reset link has been sent' };
    }

    // Generate password reset token
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'password-reset' },
      {
        secret: this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        expiresIn: '1h',
      },
    );

    // Here you would typically send an email with the reset token
    // For now, we'll just return it (remove this in production)
    return {
      message: 'Password reset link has been sent',
      resetToken, // Remove this in production
    };
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync<PasswordResetPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        },
      );

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, email: payload.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const hashedPassword = await this.hashData(newPassword);
      await this.userRepository.update(user.id, { password: hashedPassword });

      // Sign out from all devices
      await this.updateRefreshToken(user.id, null);

      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Verify email
  async verifyEmail(token: string) {
    try {
      const payload =
        await this.jwtService.verifyAsync<EmailVerificationPayload>(token, {
          secret: this.configService.getOrThrow<string>(
            'JWT_VERIFICATION_SECRET',
          ),
        });

      if (payload.type !== 'email-verification') {
        throw new UnauthorizedException('Invalid verification token');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, email: payload.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid verification token');
      }

      if (user.email_verified_at) {
        return { message: 'Email is already verified' };
      }

      await this.userRepository.update(user.id, {
        email_verified_at: new Date(),
      });

      // Send welcome email after verification
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.first_name,
        user.role,
      );

      return { message: 'Email verified successfully. Welcome email sent.' };
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, verification link has been sent',
      };
    }

    if (user.email_verified_at) {
      return { message: 'Email is already verified' };
    }

    // Generate verification token
    const verificationToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'email-verification',
      },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_VERIFICATION_SECRET',
        ),
        expiresIn: '24h',
      },
    );

    // Actually send the verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      user.first_name,
      verificationToken,
    );

    return { message: 'Verification email sent successfully' };
  }

  // Register customer
  async registerCustomer(registerDto: RegisterCustomerDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email '${registerDto.email}' already exists`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.hashData(registerDto.password);

      const userData = {
        ...registerDto,
        password: hashedPassword,
        role: Role.CUSTOMER,
        is_active: true,
      };

      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      // Generate tokens
      const tokens = await this.getTokens(
        savedUser.id,
        savedUser.email,
        savedUser.role,
      );

      // Update refresh token
      await this.updateRefreshToken(savedUser.id, tokens.refreshToken);
      // Send welcome email
      await this.emailService.sendWelcomeEmail(
        savedUser.email,
        savedUser.first_name,
        savedUser.role,
      );

      // Send verification email
      await this.resendVerificationEmail(savedUser.email);

      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, hashedRefreshToken, ...userResponse } = savedUser;

      return {
        message: 'Customer registered successfully. Please verify your email.',
        user: userResponse,
        ...tokens,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Register service provider
  async registerServiceProvider(registerDto: RegisterServiceProviderDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email '${registerDto.email}' already exists`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.hashData(registerDto.password);

      // Create a basic user with just the essential fields
      const userData = {
        email: registerDto.email,
        password: hashedPassword,
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        phone: registerDto.phone,
        role: Role.SERVICE_PROVIDER,
        is_active: true,
        is_verified: false, // Service providers need verification
      };

      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      // Register business for the service provider (provide a valid CreateBusinessDto)
      // TODO: Replace these placeholder values with real business registration data from the user
      await this.businessesService.create(
        {
          name: `${registerDto.first_name}'s Business`,
          type: 'Car Wash Service',
          description: 'Car washing and detailing services',
          business_address: registerDto.business_address || '',
          city: registerDto.city || '',
          state: registerDto.state || '',
          zip_code: registerDto.zip_code || '',
          phone: registerDto.phone || '',
          email: registerDto.email,
          // image, location_id, operating_hours can be added if available
        },
        savedUser.id,
      );

      // Generate tokens
      const tokens = await this.getTokens(
        savedUser.id,
        savedUser.email,
        savedUser.role,
      );

      // Update refresh token
      await this.updateRefreshToken(savedUser.id, tokens.refreshToken);
      // Send welcome email
      await this.emailService.sendWelcomeEmail(
        savedUser.email,
        savedUser.first_name,
        savedUser.role,
      );

      // Send verification email
      await this.resendVerificationEmail(savedUser.email);

      // Return user without sensitive fields
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userResponse } = savedUser;

      return {
        message:
          'Service provider registered successfully. Please verify your email and await business verification.',
        user: userResponse,
        ...tokens,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Delete user account
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Use a transaction to ensure all related data is deleted safely
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete businesses linked to this user
      await queryRunner.manager.delete('businesses', { user: userId });
      // TODO: Delete other related entities if needed (bookings, reviews, etc.)
      // Delete user
      await queryRunner.manager.delete(User, userId);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
