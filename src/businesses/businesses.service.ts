import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessHours } from './entities/business-hours.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UsersService } from '../users/users.service';
import { LocationsService } from '../location/locations.service';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,

    @InjectRepository(BusinessHours)
    private businessHoursRepository: Repository<BusinessHours>,

    private usersService: UsersService,
    private locationsService: LocationsService, // Note the plural name: locationsService
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
      address: createBusinessDto.address,
      city: createBusinessDto.city,
      state: createBusinessDto.state,
      zip_code: createBusinessDto.zip_code,
      phone: createBusinessDto.phone,
      email: createBusinessDto.email,
      image: createBusinessDto.image,
      location_id: createBusinessDto.location_id,
    });

    // Save business first to get the ID
    const savedBusiness = await this.businessRepository.save(business);

    // Create and save business hours
    if (createBusinessDto.operating_hours) {
      const businessHours = this.businessHoursRepository.create({
        business_id: savedBusiness.id,
        hours: createBusinessDto.operating_hours,
      });
      await this.businessHoursRepository.save(businessHours);
    }

    // Return the business with all related data
    return this.findOne(savedBusiness.id);
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      relations: ['user', 'location', 'operating_hours'],
    });
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['user', 'location', 'operating_hours'],
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async findByUserId(userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'location', 'operating_hours'],
    });

    if (!business) {
      throw new NotFoundException(
        `Business for user with ID ${userId} not found`,
      );
    }

    return business;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    // Get existing business
    const business = await this.findOne(id);

    // Update business properties
    Object.assign(business, updateBusinessDto);

    // Update operating hours if provided
    if (updateBusinessDto.operating_hours && business.operating_hours) {
      business.operating_hours.hours = updateBusinessDto.operating_hours;
      await this.businessHoursRepository.save(business.operating_hours);
    }

    // Save updated business
    return this.businessRepository.save(business);
  }

  async remove(id: string): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }
}
