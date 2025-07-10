import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateServiceProviderDto } from '../service-provider/dto/update-service-provider.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role, User } from './entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ServiceProvider } from '../service-provider/entities/service-provider.entity';
import { CustomersService } from '../customers/customers.service';
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
// import * as path from 'path';
import {
  UserProfileResponse,
  UserWithProfile,
  UserRegistrationResponse,
} from 'src/types/profile.types';
import { UpdateCustomerDto } from 'src/customers/dto/update-customer.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private customersService: CustomersService,
    private serviceProviderService: ServiceProviderService,
    private dataSource: DataSource,
    private fileUploadService: FileUploadService, // Inject FileUploadService
  ) {}

  // //hash password before saving to db
  // private async hashPassword(password: string): Promise<string> {
  //   const salt = await bcrypt.genSalt(10);
  //   return await bcrypt.hash(password, salt);
  // }

  // //remove password from the response
  // private removePassword(user: User): Partial<User> {
  //   const { password, ...rest } = user;
  //   return rest;
  // }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email '${createUserDto.email}' already exists`,
      );
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    //create a new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashPassword,
      is_active: createUserDto.is_active ?? true,
    });

    //save the user to the database
    const savedUser = await this.userRepository.save(user);
    //remove password from the response
    return savedUser;
  }

  // Find all users with optional pagination
  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    //add search functionality
    if (options?.search) {
      queryBuilder.where(
        'user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search',
        { search: `%${options.search}%` },
      );
    }

    //filter by role
    if (options?.role) {
      queryBuilder.andWhere('user.role = :role', { role: options.role });
    }

    //add sorting functionality
    const allowedSortFields = [
      'first_name',
      'last_name',
      'email',
      'created_at',
      'updated_at',
      'role',
    ];
    const sortBy = allowedSortFields.includes(options?.sortBy || '')
      ? options?.sortBy || 'created_at'
      : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(options?.sortOrder || '')
      ? options?.sortOrder || 'DESC'
      : 'DESC';
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    //add pagination
    queryBuilder.skip(skip).take(limit);

    // Execute the query and return the results
    queryBuilder.select([
      'user.id',
      'user.email',
      'user.first_name',
      'user.last_name',
      'user.phone',
      'user.role',
      'user.is_active',
      'user.email_verified_at',
      'user.created_at',
      'user.updated_at',
    ]);
    const [users, total] = await queryBuilder.getManyAndCount();
    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrevious: page > 1,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'is_active',
        'email_verified_at',
        'created_at',
        'updated_at',
      ],
    });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      //password for authentication
    });
  }

  //find by role
  async findByRole(role: Role): Promise<User[]> {
    return await this.userRepository.find({
      where: { role, is_active: true },
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'is_active',
        'email_verified_at',
        'created_at',
        'updated_at',
      ],
      order: { created_at: 'DESC' },
    });
  }

  //update user role
  async updateUserRole(id: string, role: Role): Promise<User> {
    // First check if user exists
    const user = await this.findOne(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    // Update the role
    await this.userRepository.update(id, { role });

    // Return updated user
    return await this.findOne(id);
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    //find the user first
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    //check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException(
          `User with email '${updateUserDto.email}' already exists`,
        );
      }
    }

    //hash password if it is being updated --later
    //update user
    await this.userRepository
      .update(id, updateUserDto)
      .then((result) => {
        if (result.affected === 0) {
          return `User with id ${id} not found`;
        }
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user with id ${id}`);
      });

    // Return the updated user
    return await this.findOne(id);
  }

  // Soft delete user by setting is_active to false
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    await this.userRepository.update(id, { is_active: false });
  }

  //hard delete user
  async hardDelete(id: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new UserNotFoundException(id);
    }
    await this.userRepository.delete(id);
  }

  // Restore a soft-deleted user by setting is_active to true
  async restore(id: string): Promise<User> {
    await this.userRepository.update(id, { is_active: true });
    return await this.findOne(id);
  }

  //get user profile with role-specific data
  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'service_providers',
        'customers',
        'bookings',
        'reviews',
        'notifications',
      ],
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'is_active',
        'email_verified_at',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    let profile: Customer | ServiceProvider | null = null;

    if (user.role === Role.CUSTOMER) {
      try {
        profile = await this.customersService.findByUserId(userId);
      } catch {
        // If customer profile doesn't exist, create one with defaults
        profile = await this.customersService.create(userId, {
          email_notifications: true,
          sms_notifications: true,
          preferred_contact_method: 'email',
        });
      }
    } else if (user.role === Role.SERVICE_PROVIDER) {
      try {
        profile = await this.serviceProviderService.findByUserId(userId);
      } catch {
        // Provider profile should exist, but handle gracefully
        profile = null;
      }
    }

    return {
      user,
      profile,
    } as UserProfileResponse;
  }

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<UserWithProfile<Customer | ServiceProvider>> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOneBy({
      email: registerUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email '${registerUserDto.email}' already exists`,
      );
    }

    // Use database transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash password
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(
        registerUserDto.password,
        saltRounds,
      );

      // Create user data
      const userData = {
        first_name: registerUserDto.first_name,
        last_name: registerUserDto.last_name,
        email: registerUserDto.email,
        password: hashPassword,
        phone: registerUserDto.phone,
        role: registerUserDto.role,
        is_active: registerUserDto.is_active ?? true,
      };

      // Create and save user
      const user = queryRunner.manager.create(User, userData);
      const savedUser = await queryRunner.manager.save(user);

      let profile: Customer | ServiceProvider | null = null;

      // Create role-specific profile
      if (registerUserDto.role === Role.CUSTOMER) {
        if (registerUserDto.customer_data) {
          profile = await this.customersService.create(
            savedUser.id,
            registerUserDto.customer_data,
          );
        } else {
          // Create with default values if no customer data provided
          profile = await this.customersService.create(savedUser.id, {
            email_notifications: true,
            sms_notifications: true,
            preferred_contact_method: 'email',
          });
        }
      } else if (registerUserDto.role === Role.SERVICE_PROVIDER) {
        if (!registerUserDto.provider_data) {
          throw new ConflictException(
            'Service provider data is required for provider registration',
          );
        }
        profile = await this.serviceProviderService.create(
          savedUser.id,
          registerUserDto.provider_data,
        );
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Extract everything except password from savedUser
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userResponse } = savedUser;

      // Make sure we return the correct type structure
      return {
        user: { ...userResponse, role: registerUserDto.role },
        profile: profile as Customer | ServiceProvider,
      } as UserRegistrationResponse;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async updateProfile(
    userId: string,
    updateData: {
      user?: UpdateUserDto;
      customer?: UpdateCustomerDto;
      provider?: UpdateServiceProviderDto;
    },
  ): Promise<UserProfileResponse> {
    const user = await this.findOne(userId);

    // Update user data if provided
    if (updateData.user) {
      await this.update(userId, updateData.user);
    }

    // Update user data if provided
    if (updateData.user) {
      await this.update(userId, updateData.user);
    }

    // Update role-specific profile
    if (user.role === Role.CUSTOMER && updateData.customer) {
      const customer = await this.customersService.findByUserId(userId);
      if (customer) {
        await this.customersService.update(customer.id, updateData.customer);
      }
    } else if (user.role === Role.SERVICE_PROVIDER && updateData.provider) {
      const provider = await this.serviceProviderService.findByUserId(userId);
      if (provider) {
        await this.serviceProviderService.update(
          provider.id,
          updateData.provider,
        );
      }
    }

    return this.getProfile(userId);
  }

  // Get user profile with role-specific data
  async getUserProfile(userId: string): Promise<{
    user: Partial<User>;
    profile: Customer | ServiceProvider | null;
    profileType: Role;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'is_active',
        'email_verified_at',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profileData: Customer | ServiceProvider | null = null;

    // Get role-specific profile data
    if (user.role === Role.CUSTOMER) {
      profileData = await this.customersService.findByUserId(userId);
    } else if (user.role === Role.SERVICE_PROVIDER) {
      profileData = await this.serviceProviderService.findByUserId(userId);
    }

    return {
      user,
      profile: profileData,
      profileType: user.role,
    };
  }

  // Update user profile (basic user info)
  async updateUserProfile(
    userId: string,
    updateData: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update basic user fields
    const updatedUser = this.userRepository.merge(user, updateData);
    return await this.userRepository.save(updatedUser);
  }

  // Update customer profile
  async updateCustomerProfile(
    userId: string,
    updateData: UpdateCustomerDto,
  ): Promise<Customer> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.CUSTOMER) {
      throw new BadRequestException('User is not a customer');
    }

    return await this.customersService.updateByUserId(userId, updateData);
  }

  // Update service provider profile
  async updateServiceProviderProfile(
    userId: string,
    updateData: UpdateServiceProviderDto,
  ): Promise<ServiceProvider> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.SERVICE_PROVIDER) {
      throw new BadRequestException('User is not a service provider');
    }

    return await this.serviceProviderService.updateByUserId(userId, updateData);
  }

  // Verify user email
  async verifyEmail(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.email_verified_at = new Date();
    return await this.userRepository.save(user);
  }

  // Upload profile avatar
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user already has an avatar, delete the old one
    if (user.avatar) {
      try {
        await this.fileUploadService.deleteAvatar(user.avatar);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }

    // Save new avatar - no await needed as it returns a string directly
    const filename = this.fileUploadService.saveAvatar(file);

    // Update user record with new avatar filename
    user.avatar = filename;
    await this.userRepository.save(user);

    return filename;
  }

  // Get user avatar
  getAvatar(filename: string): { exists: boolean; stream?: fs.ReadStream } {
    const filePath = this.fileUploadService.getAvatarPath(filename);

    if (fs.existsSync(filePath)) {
      return {
        exists: true,
        stream: fs.createReadStream(filePath),
      };
    } else {
      return { exists: false };
    }
  }

  // Get dashboard data based on user role
  async getDashboardData(userId: string): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
    stats?: {
      totalBookings?: number;
      totalSpent?: number;
      loyaltyTier?: string;
      loyaltyPoints?: number;
      totalServices?: number;
      rating?: number;
      isVerified?: boolean;
      businessName?: string;
      monthlyRevenue?: number;
    };
    recentBookings?: any[];
    upcomingBookings?: any[];
    popularServices?: any[];
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const baseData = {
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    };

    // Define current date and upcoming date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Common query for recent bookings
    const getRecentBookingsQuery = (userIdField: string) =>
      this.dataSource
        .createQueryBuilder()
        .select('booking')
        .from('bookings', 'booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('booking.user', 'customer')
        .leftJoinAndSelect('service.provider', 'provider')
        .where(`booking.${userIdField} = :userId`, { userId })
        .orderBy('booking.created_at', 'DESC')
        .limit(5);

    // Common query for upcoming bookings
    const getUpcomingBookingsQuery = (userIdField: string) =>
      this.dataSource
        .createQueryBuilder()
        .select('booking')
        .from('bookings', 'booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('booking.user', 'customer')
        .leftJoinAndSelect('service.provider', 'provider')
        .where(`booking.${userIdField} = :userId`, { userId })
        .andWhere('booking.service_date >= :today', { today })
        .andWhere(`booking.status NOT IN ('cancelled', 'completed')`)
        .orderBy('booking.service_date', 'ASC')
        .addOrderBy('booking.service_time', 'ASC')
        .limit(5);

    if (user.role === Role.CUSTOMER) {
      const customer = await this.customersService.findByUserId(userId);

      // Get recent bookings for the customer
      const recentBookings = await getRecentBookingsQuery('user_id').getMany();

      // Get upcoming bookings for the customer
      const upcomingBookings =
        await getUpcomingBookingsQuery('user_id').getMany();

      return {
        ...baseData,
        stats: {
          totalBookings: customer?.total_bookings || 0,
          totalSpent: customer?.total_spent || 0,
          loyaltyTier: customer?.loyalty_tier || 'bronze',
          loyaltyPoints: customer?.loyalty_points || 0,
        },
        recentBookings,
        upcomingBookings,
      };
    } else if (user.role === Role.SERVICE_PROVIDER) {
      const provider = await this.serviceProviderService.findByUserId(userId);

      // Get recent bookings for services provided by this provider
      const recentBookings = await this.dataSource
        .createQueryBuilder()
        .select('booking')
        .from('bookings', 'booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('booking.user', 'customer')
        .where('service.provider_id = :providerId', {
          providerId: provider?.id,
        })
        .orderBy('booking.created_at', 'DESC')
        .limit(5)
        .getMany();

      // Get upcoming bookings for services provided by this provider
      const upcomingBookings = await this.dataSource
        .createQueryBuilder()
        .select('booking')
        .from('bookings', 'booking')
        .leftJoinAndSelect('booking.service', 'service')
        .leftJoinAndSelect('booking.user', 'customer')
        .where('service.provider_id = :providerId', {
          providerId: provider?.id,
        })
        .andWhere('booking.service_date >= :today', { today })
        .andWhere(`booking.status NOT IN ('cancelled', 'completed')`)
        .orderBy('booking.service_date', 'ASC')
        .addOrderBy('booking.service_time', 'ASC')
        .limit(5)
        .getMany();

      // Get popular services by booking count
      const popularServices = await this.dataSource
        .createQueryBuilder()
        .select('service')
        .from('services', 'service')
        .where('service.provider_id = :providerId', {
          providerId: provider?.id,
        })
        .orderBy('service.booking_count', 'DESC')
        .limit(5)
        .getMany();

      // Calculate monthly revenue from bookings
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenueResult = await this.dataSource
        .createQueryBuilder()
        .select('SUM(booking.total_amount)', 'revenue')
        .from('bookings', 'booking')
        .leftJoin('booking.service', 'service')
        .where('service.provider_id = :providerId', {
          providerId: provider?.id,
        })
        .andWhere('booking.created_at >= :startOfMonth', { startOfMonth })
        .andWhere(`booking.status NOT IN ('cancelled')`)
        .getRawOne();

      const monthlyRevenue = parseFloat(monthlyRevenueResult?.revenue || '0');

      // Count total bookings
      const totalBookingsResult = await this.dataSource
        .createQueryBuilder()
        .select('COUNT(booking.id)', 'count')
        .from('bookings', 'booking')
        .leftJoin('booking.service', 'service')
        .where('service.provider_id = :providerId', {
          providerId: provider?.id,
        })
        .getRawOne();

      const totalBookings = parseInt(totalBookingsResult?.count || '0');

      return {
        ...baseData,
        stats: {
          totalServices: provider?.total_services || 0,
          rating: provider?.rating || 0,
          isVerified: provider?.is_verified || false,
          businessName: provider?.business_name || '',
          totalBookings,
          monthlyRevenue,
        },
        recentBookings,
        upcomingBookings,
        popularServices: popularServices.map((service) => ({
          id: service.id,
          name: service.name,
          bookingCount: service.booking_count,
        })),
      };
    }

    return baseData;
  }
}
