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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FindUsersDto } from './dto/find-users.dto';

@ApiTags('Users')
@UseInterceptors(ClassSerializerInterceptor) // Automatically excludes password field
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
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
  async getProfile(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
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
}
