import {
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
  ForbiddenException,
  Controller,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { BusinessesService } from '../businesses/businesses.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorators';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/users/entities/user.entity';
import { GetCurrentUserId } from 'src/auth/decorators/get-current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage, memoryStorage } from 'multer';

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
  constructor(
    private readonly servicesService: ServicesService,
    private readonly businessesService: BusinessesService,
    private readonly fileUploadService: FileUploadService, // Assuming you have a file upload service
  ) {}
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
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.SERVICE_PROVIDER)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new service' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file type'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
    }),
  )
  async createService(
    @UploadedFile() image: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true }))
    createServiceDto: CreateServiceDto,
    @GetCurrentUserId() userId: string,
  ): Promise<Service> {
    //validate that the business belongs to the user
    const business = await this.businessesService.findByUserId(userId);
    if (!business || business.id !== createServiceDto.business_id) {
      throw new ForbiddenException('you do not own this business');
    }
    //handle image upload
    if (image) {
      const { url } = await this.fileUploadService.saveServiceImage(image);
      createServiceDto.image_url = url;
    }
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all services with optional filters' })
  @ApiQuery({
    name: 'category',
    enum: Object.values(ServiceCategory),
    required: false,
  })
  @ApiQuery({ name: 'business_id', required: false })
  @ApiQuery({ name: 'locationId', required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: [Service],
  })
  findAll(@Query('search') search?: string) {
    const filters: ServiceFilterDto = {
      search,
    };
    console.log('Received service data:', filters);
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
