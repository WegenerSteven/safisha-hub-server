import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServicePricing } from './entities/service-pricing.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/user.entity';
import { ServiceStatus } from './enums/service.enums';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { CreateServicePricingDto } from './dto/create-service-pricing.dto';
import { ServiceFilterDto } from './dto/service-filter.dto';
import { Business } from '../businesses/entities/business.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private readonly categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(ServicePricing)
    private readonly pricingRepository: Repository<ServicePricing>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  // Service Category Methods
  async createCategory(
    createCategoryDto: CreateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    // Check if category name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Service category with this name already exists',
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(isActive?: boolean): Promise<ServiceCategory[]> {
    const where: FindOptionsWhere<ServiceCategory> = {};
    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    return await this.categoryRepository.find({
      where,
      relations: ['services'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<ServiceCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!category) {
      throw new NotFoundException('Service category not found');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateServiceCategoryDto,
  ): Promise<ServiceCategory> {
    const category = await this.findCategoryById(id);

    // Check if new name conflicts with existing category
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException(
          'Service category with this name already exists',
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);

    // Check if category has services
    const servicesCount = await this.serviceRepository.count({
      where: { category_id: id },
    });

    if (servicesCount > 0) {
      throw new BadRequestException(
        'Cannot delete category that has services. Please reassign or delete services first.',
      );
    }

    await this.categoryRepository.remove(category);
  }

  // Service Methods
  async createForUser(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    console.log('Creating service for user:', userId);

    // First, find the service provider (user with SERVICE_PROVIDER role)
    const serviceProvider = await this.userRepository.findOne({
      where: { id: userId, role: Role.SERVICE_PROVIDER },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        'Service provider profile not found. Please complete your provider profile first.',
      );
    }

    console.log('Service provider found:', serviceProvider.business_name);

    // Now create the service with the correct business_id
    const serviceData = {
      ...createServiceDto,
      business_id: serviceProvider.id,
    };

    return this.create(serviceData);
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    console.log('Creating service with DTO:', createServiceDto);
    // Verify business exists
    const business = await this.businessRepository.findOne({
      where: { id: createServiceDto.business_id },
    });
    if (!business) {
      throw new NotFoundException(
        `Business with ID ${createServiceDto.business_id} not found`,
      );
    }

    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createServiceDto.category_id, is_active: true },
    });

    if (!category) {
      throw new NotFoundException('Service category not found or inactive');
    }

    console.log('Category found:', category.name);

    //convert dto to entity
    const service = this.serviceRepository.create({
      ...createServiceDto,
      category: { id: createServiceDto.category_id },
      business: { id: createServiceDto.business_id },
    });
    // const service = this.serviceRepository.create(createServiceDto);
    console.log('Service entity created, saving to database...');
    try {
      const savedService = await this.serviceRepository.save(service);
      console.log('Service saved successfully:', savedService.id);
      return savedService;
    } catch (error) {
      console.error('Error saving service:', error);
      throw new BadRequestException('Failed to create service: ' + error);
    }
    // return this.serviceRepository.save(service);
  }

  async createForUserBusiness(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    console.log('Creating service for user:', userId);

    // First, find the service provider (user with SERVICE_PROVIDER role)
    const serviceProvider = await this.userRepository.findOne({
      where: { id: userId, role: Role.SERVICE_PROVIDER },
    });

    if (!serviceProvider) {
      throw new NotFoundException(
        'Service provider profile not found. Only service providers can create services.',
      );
    }

    // Find the business for this user
    const business = await this.businessRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new BadRequestException(
        'Business not found. Please register your business first before adding services.',
      );
    }

    console.log('Business found:', business.name);

    // Now create the service with the business_id
    const serviceData = {
      ...createServiceDto,
      business_id: business.id,
    };

    return this.createWithBusiness(serviceData);
  }

  async createWithBusiness(
    createServiceDto: CreateServiceDto & { business_id: string },
  ): Promise<Service> {
    console.log('Creating service with business DTO:', createServiceDto);

    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createServiceDto.category_id, is_active: true },
    });

    if (!category) {
      throw new NotFoundException('Service category not found or inactive');
    }

    // Verify business exists
    const business = await this.businessRepository.findOne({
      where: { id: createServiceDto.business_id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    try {
      const service = this.serviceRepository.create({
        ...createServiceDto,
        status: ServiceStatus.ACTIVE,
      });

      const savedService = await this.serviceRepository.save(service);
      console.log('Service created successfully:', savedService);

      return savedService;
    } catch (error: unknown) {
      console.error('Error creating service:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to create service: ${errorMessage}`,
      );
    }
  }

  async findAll(filters: ServiceFilterDto = {}) {
    const {
      search,
      business_id,
      category_id,
      location_id,
      status,
      service_type,
      vehicle_type,
      is_available,
      min_price,
      max_price,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = filters;

    const queryBuilder: SelectQueryBuilder<Service> = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.business', 'business')
      .leftJoinAndSelect('business.user', 'user')
      // .leftJoinAndSelect('service.pricing', 'pricing')
      .leftJoinAndSelect('service.addons', 'addons');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (business_id) {
      queryBuilder.andWhere('service.business_id = :business_id', {
        business_id,
      });
    }

    // Legacy support for business_id
    if (business_id && !business_id) {
      // Find the business ID that belongs to this provider
      const business = await this.businessRepository.findOne({
        where: { user: { id: business_id } },
      });

      if (business) {
        queryBuilder.andWhere('service.business_id = :business_id', {
          business_id: business.id,
        });
      }
    }

    if (category_id) {
      queryBuilder.andWhere('service.category_id = :category_id', {
        category_id,
      });
    }

    if (location_id) {
      queryBuilder.andWhere('service.location_id = :location_id', {
        location_id,
      });
    }

    if (status) {
      queryBuilder.andWhere('service.status = :status', { status });
    }

    if (service_type) {
      queryBuilder.andWhere('service.service_type = :service_type', {
        service_type,
      });
    }

    if (vehicle_type) {
      queryBuilder.andWhere('service.vehicle_type = :vehicle_type', {
        vehicle_type,
      });
    }

    if (is_available !== undefined) {
      queryBuilder.andWhere('service.is_available = :is_available', {
        is_available,
      });
    }

    if (min_price !== undefined || max_price !== undefined) {
      if (min_price !== undefined && max_price !== undefined) {
        queryBuilder.andWhere(
          'service.base_price BETWEEN :min_price AND :max_price',
          {
            min_price,
            max_price,
          },
        );
      } else if (min_price !== undefined) {
        queryBuilder.andWhere('service.base_price >= :min_price', {
          min_price,
        });
      } else if (max_price !== undefined) {
        queryBuilder.andWhere('service.base_price <= :max_price', {
          max_price,
        });
      }
    }

    // Apply sorting
    const validSortFields = [
      'name',
      'base_price',
      'created_at',
      'average_rating',
      'booking_count',
    ];
    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : 'created_at';
    queryBuilder.orderBy(`service.${sortField}`, sort_order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Use only the services array since we don't need the count
    const [services] = await queryBuilder.getManyAndCount();

    // Return just the services array to match the client's expectation
    return services;
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: [
        'category',
        'business',
        // 'business.operating_hours',
        // 'pricing',
        // 'addons',
        // 'location',
      ],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async findByProvider(providerId: string, filters: ServiceFilterDto = {}) {
    // Find the business for this provider
    const business = await this.businessRepository.findOne({
      where: { user: { id: providerId } },
    });

    if (!business) {
      return [];
    }

    return this.findAll({ ...filters, business_id: business.id });
  }

  async findByProviderId(userId: string): Promise<Service[]> {
    try {
      // First find the service provider (user with SERVICE_PROVIDER role)
      const serviceProvider = await this.userRepository.findOne({
        where: { id: userId, role: Role.SERVICE_PROVIDER },
      });

      if (!serviceProvider) {
        console.log('No service provider found for user:', userId);
        return [];
      }

      // Now get services for this provider
      // Find the business for this provider
      const business = await this.businessRepository.findOne({
        where: { user: { id: serviceProvider.id } },
      });

      if (!business) {
        console.log('No business found for provider:', serviceProvider.id);
        return [];
      }

      const services = await this.serviceRepository.find({
        where: { business_id: business.id },
        relations: [
          'category',
          'business',
          'business.user',
          // 'business.operating_hours',
          // 'pricings',
        ],
        order: { created_at: 'DESC' },
      });

      console.log(
        'Found',
        services.length,
        'services for provider:',
        serviceProvider.business_name,
      );
      return services;
    } catch (error) {
      console.error('Error finding services by provider ID:', error);
      return [];
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id);

    // Validate category if being updated
    if (updateServiceDto.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateServiceDto.category_id, is_active: true },
      });

      if (!category) {
        throw new NotFoundException('Service category not found or inactive');
      }
    }

    // // Validate pricing
    // const basePrice = updateServiceDto.base_price ?? service.base_price;
    // const discountedPrice =
    //   updateServiceDto.discounted_price ?? service.discounted_price;

    // if (discountedPrice && discountedPrice >= basePrice) {
    //   throw new BadRequestException(
    //     'Discounted price must be less than base price',
    //   );
    // }

    Object.assign(service, updateServiceDto);
    return await this.serviceRepository.save(service);
  }

  async updateStatus(id: string, status: ServiceStatus): Promise<Service> {
    return this.update(id, { status });
  }

  async toggleAvailability(id: string): Promise<Service> {
    const service = await this.findOne(id);
    return this.update(id, { is_available: !service.is_available });
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);

    // Check if service has active bookings
    // You might want to add this check when you implement bookings
    // const activeBookings = await this.bookingRepository.count({
    //   where: { service_id: id, status: BookingStatus.ACTIVE }
    // });

    // if (activeBookings > 0) {
    //   throw new BadRequestException('Cannot delete service with active bookings');
    // }

    await this.serviceRepository.remove(service);
  }

  // Service Pricing Methods
  async createPricing(
    createPricingDto: CreateServicePricingDto,
  ): Promise<ServicePricing> {
    // Verify service exists - this will throw if service doesn't exist
    await this.findOne(createPricingDto.service_id);

    // Check if pricing already exists for this combination
    const existingPricing = await this.pricingRepository.findOne({
      where: {
        service_id: createPricingDto.service_id,
        vehicle_type: createPricingDto.vehicle_type,
        pricing_tier: createPricingDto.pricing_tier,
      },
    });

    if (existingPricing) {
      throw new ConflictException(
        'Pricing already exists for this service, vehicle type, and pricing tier combination',
      );
    }

    const pricing = this.pricingRepository.create(createPricingDto);
    return await this.pricingRepository.save(pricing);
  }

  async findPricingByService(serviceId: string): Promise<ServicePricing[]> {
    return await this.pricingRepository.find({
      where: { service_id: serviceId },
      relations: ['service'],
      order: { vehicle_type: 'ASC', pricing_tier: 'ASC' },
    });
  }

  async updatePricing(
    id: string,
    updateData: Partial<ServicePricing>,
  ): Promise<ServicePricing> {
    const pricing = await this.pricingRepository.findOne({ where: { id } });

    if (!pricing) {
      throw new NotFoundException('Service pricing not found');
    }

    Object.assign(pricing, updateData);
    return await this.pricingRepository.save(pricing);
  }

  async deletePricing(id: string): Promise<void> {
    const pricing = await this.pricingRepository.findOne({ where: { id } });

    if (!pricing) {
      throw new NotFoundException('Service pricing not found');
    }

    await this.pricingRepository.remove(pricing);
  }

  // Popular and Featured Services
  async findPopularServices(limit: number = 10): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { status: ServiceStatus.ACTIVE, is_available: true },
      order: { booking_count: 'DESC', created_at: 'DESC' },
      take: limit,
      relations: ['category', 'business' /*'business.operating_hours'*/],
    });
  }

  async findFeaturedServices(limit: number = 10): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: { status: ServiceStatus.ACTIVE, is_available: true },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['category', 'business' /*'business.operating_hours'*/],
    });
  }
}
