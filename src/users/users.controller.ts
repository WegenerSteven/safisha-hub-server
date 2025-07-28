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
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterServiceProviderDto } from './dto/register-service-provider.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Role } from './entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUserId } from 'src/auth/decorators/get-current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('register/customer')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async registerCustomer(@Body() registerDto: RegisterCustomerDto) {
    return this.usersService.registerCustomer(registerDto);
  }

  @Post('register/service-provider')
  @ApiOperation({ summary: 'Register a new service provider' })
  @ApiResponse({
    status: 201,
    description: 'Service provider registered successfully.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async registerServiceProvider(
    @Body() registerDto: RegisterServiceProviderDto,
  ) {
    return this.usersService.registerServiceProvider(registerDto);
  }

  @Get()
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with optional filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.usersService.findAll({
      page,
      limit,
      search,
      role,
      sortBy,
      sortOrder,
    });
  }

  @Get('service-providers/nearby')
  @ApiOperation({ summary: 'Find nearby service providers' })
  @ApiQuery({
    name: 'latitude',
    required: true,
    type: Number,
    description: 'User latitude',
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    type: Number,
    description: 'User longitude',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Search radius in km (default: 10)',
  })
  async findNearbyServiceProviders(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.usersService.findNearbyServiceProviders(
      latitude,
      longitude,
      radius,
    );
  }

  @Get('by-role/:role')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: Role, description: 'User role' })
  async findByRole(@Param('role') role: Role) {
    return this.usersService.findByRole(role);
  }

  @Get(':id')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/service-provider-profile')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service provider business profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateServiceProviderProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateData: {
      business_name?: string;
      business_description?: string;
      business_address?: string;
      business_phone?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.usersService.updateServiceProviderProfile(id, updateData);
  }

  @Patch(':id/verify')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify service provider' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async verifyServiceProvider(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.verifyServiceProvider(id);
  }

  @Delete(':id')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Put('profile')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @GetCurrentUserId() userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, updateDto);
  }

  @Post('profile/avatar')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @GetCurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.uploadAvatar(userId, file);
  }
}
