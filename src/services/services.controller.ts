import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceStatus, ServiceType, VehicleType } from './enums/service.enums';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { Public } from '../auth/decorators/public.decorators';

// Define an interface for the request object with user property
interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role?: string;
    [key: string]: any;
  };
}

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get all service categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [ServiceCategory],
  })
  async getCategories(@Query('isActive') isActive?: boolean) {
    const categories = await this.servicesService.findAllCategories(isActive);
    return {
      success: true,
      data: categories,
      message: 'Service categories retrieved successfully',
    };
  }

  @Post()
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: Service,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Request() req: RequestWithUser,
  ): Promise<Service> {
    // Get the user_id from the authenticated user
    const userId = req.user.id;
    console.log('Creating service for user:', userId);

    // We need to resolve the service provider ID from the user ID
    // For now, let's use the userId as provider_id and let the service handle the lookup
    const serviceData = {
      ...createServiceDto,
      provider_id: userId, // This will be resolved in the service
    };

    console.log('Service creation data:', serviceData);

    return this.servicesService.createForUser(userId, createServiceDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all services with optional filters' })
  @ApiQuery({
    name: 'category',
    enum: Object.values(ServiceCategory),
    required: false,
  })
  @ApiQuery({ name: 'providerId', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: [Service],
  })
  findAll(
    @Query('search') search?: string,
    @Query('provider_id') provider_id?: string,
    @Query('category_id') category_id?: string,
    @Query('location_id') location_id?: string,
    @Query('status') status?: ServiceStatus,
    @Query('service_type') service_type?: ServiceType,
    @Query('vehicle_type') vehicle_type?: VehicleType,
    @Query('is_available') is_available?: boolean,
    @Query('min_price') min_price?: number,
    @Query('max_price') max_price?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort_by') sort_by?: string,
    @Query('sort_order') sort_order?: 'ASC' | 'DESC',
  ) {
    const filters: ServiceFilterDto = {
      search,
      provider_id,
      category_id,
      location_id,
      status,
      service_type,
      vehicle_type,
      is_available,
      min_price,
      max_price,
      page,
      limit,
      sort_by,
      sort_order,
    };

    return this.servicesService.findAll(filters);
  }

  @Get('provider/:providerId')
  @Public()
  @ApiOperation({ summary: 'Get services by provider' })
  @ApiParam({ name: 'providerId', description: 'Provider UUID' })
  @ApiResponse({
    status: 200,
    description: 'Services by provider',
  })
  findByProvider(@Param('providerId', ParseUUIDPipe) providerId: string) {
    return this.servicesService.findByProvider(providerId);
  }

  @Get('provider')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all services for the current provider' })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: [Service],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProviderServices(@Request() req: RequestWithUser) {
    const services = await this.servicesService.findByProviderId(req.user.id);
    return {
      success: true,
      data: services,
      message: 'Provider services retrieved successfully',
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 200, description: 'Service found', type: Service })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.remove(id);
  }
}
