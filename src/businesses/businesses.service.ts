import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
// import { BusinessHours } from './entities/business-hours.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UsersService } from '../users/users.service';
// import { LocationsService } from '../location/locations.service';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,

    private usersService: UsersService,
    // private locationsService: LocationsService, // Note the plural name: locationsService
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    // Verify user exists
    const user = await this.usersService.findOne(createBusinessDto.user_id);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createBusinessDto.user_id} not found`,
      );
    }

    // Create business entity
    const business = this.businessRepository.create({
      user_id: createBusinessDto.user_id,
      name: createBusinessDto.name,
      type: createBusinessDto.type,
      description: createBusinessDto.description,
      business_address: createBusinessDto.business_address,
      city: createBusinessDto.city,
      state: createBusinessDto.state,
      zip_code: createBusinessDto.zip_code,
      phone: createBusinessDto.phone,
      email: createBusinessDto.email,
      image: createBusinessDto.image,
      is_verified: createBusinessDto.is_verified || false,
      // location_id: createBusinessDto.location_id,
    });

    // Save business first to get the ID
    const savedBusiness = await this.businessRepository.save(business);

    // Return the business with all related data
    return this.findOne(savedBusiness.id);
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      relations: ['user', 'services'],
    });
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async findByUserId(userId: string): Promise<Business | null> {
    return this.businessRepository.findOne({
      where: { user_id: userId },
    });
  }

  async getBusinessServices(businessId: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services', 'services.category'],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    return business.services;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    // Get existing business
    const business = await this.findOne(id);

    // Update business properties
    Object.assign(business, updateBusinessDto);

    // Save updated business
    return this.businessRepository.save(business);
  }

  async remove(id: string): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }
}
