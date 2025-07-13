import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterServiceProviderDto } from './dto/register-service-provider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role, User } from './entities/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
    private fileUploadService: FileUploadService,
  ) {}

  // Hash password utility
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Remove sensitive fields from response
  private excludeSensitiveFields(user: User): Partial<User> {
    const { password, hashedRefreshToken, ...result } = user;
    return result;
  }

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

    const hashPassword = await this.hashPassword(createUserDto.password);

    // Create a new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashPassword,
      is_active: createUserDto.is_active ?? true,
    });

    const savedUser = await this.userRepository.save(user);
    return this.excludeSensitiveFields(savedUser);
  }

  // Register customer
  async registerCustomer(
    registerDto: RegisterCustomerDto,
  ): Promise<Partial<User>> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOneBy({
      email: registerDto.email,
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email '${registerDto.email}' already exists`,
      );
    }

    const hashPassword = await this.hashPassword(registerDto.password);

    // Create customer user
    const userData = {
      ...registerDto,
      password: hashPassword,
      role: Role.CUSTOMER,
      is_active: true,
    };

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    return this.excludeSensitiveFields(savedUser);
  }

  // Register service provider
  async registerServiceProvider(
    registerDto: RegisterServiceProviderDto,
  ): Promise<Partial<User>> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOneBy({
      email: registerDto.email,
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email '${registerDto.email}' already exists`,
      );
    }

    const hashPassword = await this.hashPassword(registerDto.password);

    // Create service provider user
    const userData = {
      ...registerDto,
      password: hashPassword,
      role: Role.SERVICE_PROVIDER,
      is_active: true,
      is_verified: false, // Service providers need verification
    };

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    return this.excludeSensitiveFields(savedUser);
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

    // Add search functionality
    if (options?.search) {
      queryBuilder.where(
        'user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search',
        { search: `%${options.search}%` },
      );
    }

    // Filter by role
    if (options?.role) {
      queryBuilder.andWhere('user.role = :role', { role: options.role });
    }

    // Add sorting functionality
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

    // Add pagination
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
        // Include role-specific fields
        'address',
        'business_name',
        'business_description',
        'business_address',
        'business_phone',
        'rating',
        'total_services',
        'is_verified',
        'latitude',
        'longitude',
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
      // Include password for authentication
    });
  }

  // Find by role
  async findByRole(role: Role): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
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
  }

  // Find service providers with location for nearby search
  async findNearbyServiceProviders(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
  ): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: Role.SERVICE_PROVIDER })
      .andWhere('user.latitude IS NOT NULL AND user.longitude IS NOT NULL')
      .andWhere(
        `(6371 * acos(cos(radians(:latitude)) * cos(radians(user.latitude)) * cos(radians(user.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(user.latitude)))) <= :radius`,
        { latitude, longitude, radius: radiusKm },
      )
      .select([
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.business_name',
        'user.business_description',
        'user.business_address',
        'user.business_phone',
        'user.rating',
        'user.total_services',
        'user.is_verified',
        'user.latitude',
        'user.longitude',
      ])
      .getMany();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // Update service provider business info
  async updateServiceProviderProfile(
    id: string,
    updateData: {
      business_name?: string;
      business_description?: string;
      business_address?: string;
      business_phone?: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<User> {
    const user = await this.findOne(id);

    if (user.role !== Role.SERVICE_PROVIDER) {
      throw new BadRequestException('User is not a service provider');
    }

    await this.userRepository.update(id, updateData);
    return this.findOne(id);
  }

  // Verify service provider
  async verifyServiceProvider(id: string): Promise<User> {
    const user = await this.findOne(id);

    if (user.role !== Role.SERVICE_PROVIDER) {
      throw new BadRequestException('User is not a service provider');
    }

    await this.userRepository.update(id, { is_verified: true });
    return this.findOne(id);
  }

  // Update user stats (for analytics)
  async updateUserStats(
    userId: string,
    stats: {
      total_bookings?: number;
      total_spent?: number;
      loyalty_points?: number;
      loyalty_tier?: string;
      total_services?: number;
      rating?: number;
    },
  ): Promise<void> {
    await this.userRepository.update(userId, stats);
  }
}
