import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  ParseUUIDPipe,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  Put,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ServiceProvider } from '../service-provider/entities/service-provider.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FindUsersDto } from './dto/find-users.dto';
import { UserProfileResponse } from 'src/types/profile.types';
import { AtGuard } from '../auth/guards/at.guard';
import {
  UpdateUserProfileDto,
  UpdateCustomerProfileDto,
  UpdateServiceProviderProfileDto,
} from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
// import { join } from 'path';
// import { createReadStream, existsSync } from 'fs';

// Define an interface for the request object with user property
interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: Role;
    [key: string]: any;
  };
}

// Define an interface for the request object with user property
interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
    [key: string]: any;
  };
}

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor) // Automatically excludes password field
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get current user profile
  @Get('profile')
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Get current user profile with role-specific data' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Request() req: RequestWithUser): Promise<{
    success: boolean;
    data: {
      user: Partial<User>;
      profile: Customer | ServiceProvider | null;
      profileType: Role;
    };
    message: string;
  }> {
    const profile = await this.usersService.getUserProfile(req.user.id);
    return {
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
    };
  }

  // Update user basic profile
  @Put('profile')
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Update user basic profile information' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateUserProfileDto,
  ) {
    const updatedUser = await this.usersService.updateUserProfile(
      req.user.id,
      updateData,
    );
    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    };
  }

  // Update customer profile
  @Put('profile/customer')
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Update customer-specific profile information' })
  @ApiResponse({
    status: 200,
    description: 'Customer profile updated successfully',
  })
  async updateCustomerProfile(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateCustomerProfileDto,
  ) {
    const updatedCustomer = await this.usersService.updateCustomerProfile(
      req.user.id,
      updateData,
    );
    return {
      success: true,
      data: updatedCustomer,
      message: 'Customer profile updated successfully',
    };
  }

  // Update service provider profile
  @Put('profile/service-provider')
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Update service provider profile information' })
  @ApiResponse({
    status: 200,
    description: 'Service provider profile updated successfully',
  })
  async updateServiceProviderProfile(
    @Request() req: RequestWithUser,
    @Body() updateData: UpdateServiceProviderProfileDto,
  ) {
    const updatedProvider =
      await this.usersService.updateServiceProviderProfile(
        req.user.id,
        updateData,
      );
    return {
      success: true,
      data: updatedProvider,
      message: 'Service provider profile updated successfully',
    };
  }

  // Get dashboard data
  @Get('dashboard')
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Get user dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@Request() req: RequestWithUser): Promise<{
    success: boolean;
    data: {
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
      };
    };
    message: string;
  }> {
    const dashboardData = await this.usersService.getDashboardData(req.user.id);
    return {
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully',
    };
  }

  // Verify email
  @Post('verify-email')
  @UseGuards(AtGuard)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Request() req: RequestWithUser) {
    const user = await this.usersService.verifyEmail(req.user.id);
    return {
      success: true,
      data: user,
      message: 'Email verified successfully',
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user with role-specific data' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered with profile data',
    type: User,
  })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by user role',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field (default: created_at)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (default: DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async findAll(@Query() query: FindUsersDto) {
    const { page, limit, search, role, sortBy, sortOrder } = query;
    return await this.usersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      role,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  //get user profile
  @Get(':id/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user profile with related data' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserProfileResponse> {
    return await this.usersService.getProfile(id);
  }

  //get user by role
  @Get('role/:role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: Role, description: 'User role' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async getUsersByRole(@Param('role') role: Role): Promise<User[]> {
    return await this.usersService.findByRole(role);
  }

  //update user information
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  //partial update user
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Partially update user information' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDto);
  }

  //update user role
  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<User> {
    return await this.usersService.updateUserRole(id, updateRoleDto.role);
  }

  //delete operations   --soft delete
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user (deactivate)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 204,
    description: 'User deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.usersService.remove(id);
  }

  //restore user
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft-deleted user' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    type: User,
  })
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return await this.usersService.restore(id);
  }

  //get user profile with role-specific data
  @Get('profile/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user profile with role-specific data' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.getProfile(id);
  }

  // Upload user avatar
  @Post('profile/avatar')
  @UseGuards(AtGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
  })
  async uploadAvatar(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatar = await this.usersService.uploadAvatar(req.user.id, file);
    return {
      success: true,
      data: { avatar },
      message: 'Avatar uploaded successfully',
    };
  }

  // Get user avatar
  @Get('profile/avatar/:filename')
  @ApiOperation({ summary: 'Get user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar retrieved successfully',
  })
  getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const file = this.usersService.getAvatar(filename);
    if (file.exists && file.stream) {
      return file.stream.pipe(res);
    } else {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found',
      });
    }
  }
}
