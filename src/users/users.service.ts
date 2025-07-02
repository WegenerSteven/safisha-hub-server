import { ConflictException, Injectable } from '@nestjs/common';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'DESC';
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
      'user.createdAt',
      'user.updatedAt',
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

  //get user profile
  async getProfile(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['service_providers', 'bookings', 'reviews', 'notifications'],
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
}
