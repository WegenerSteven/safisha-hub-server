import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessHours } from './entities/business-hours.entity';
import { RegisterServiceProviderDto } from '../users/dto/register-service-provider.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class BusinessRegistrationService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(BusinessHours)
    private businessHoursRepository: Repository<BusinessHours>,
    private usersService: UsersService,
  ) {}

  async registerBusinessFromServiceProvider(
    userId: string,
    registerDto: RegisterServiceProviderDto,
  ): Promise<Business> {
    // Check if the user already has a business
    const existingBusiness = await this.businessRepository.findOne({
      where: { user_id: userId },
    });

    if (existingBusiness) {
      throw new ConflictException(
        `User with ID ${userId} already has a registered business`,
      );
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create business entity
      const business = new Business();
      business.user_id = userId;
      business.name =
        registerDto.business_name || `${registerDto.first_name}'s Business`;
      business.type = registerDto.business_type || 'Car Wash Service';
      business.description =
        registerDto.business_description ||
        'Car washing and detailing services';
      business.address = registerDto.business_address || '';
      business.city = registerDto.city || '';
      business.state = registerDto.state || '';
      business.zip_code = registerDto.zip_code || '';
      business.phone = registerDto.business_phone || registerDto.phone || '';
      business.email = registerDto.business_email || registerDto.email;
      if (registerDto.business_image) {
        business.image = registerDto.business_image;
      }
      business.latitude = registerDto.latitude;
      business.longitude = registerDto.longitude;
      business.is_verified = false;

      // Save business
      const savedBusiness = await queryRunner.manager.save(business);

      // Create business hours if provided
      if (registerDto.operating_hours) {
        const businessHours = new BusinessHours();
        businessHours.business_id = savedBusiness.id;
        businessHours.hours = registerDto.operating_hours;
        await queryRunner.manager.save(businessHours);
      }

      await queryRunner.commitTransaction();
      const result = await this.businessRepository.findOne({
        where: { id: savedBusiness.id },
        relations: ['operating_hours'],
      });

      if (!result) {
        throw new Error(
          `Failed to retrieve the created business with ID ${savedBusiness.id}`,
        );
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createBusinessFromDto(
    createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    // Check if user exists
    try {
      await this.usersService.findOne(createBusinessDto.user_id);
    } catch (error) {
      throw new ConflictException(
        `User with ID ${createBusinessDto.user_id} does not exist: ${error}`,
      );
    }

    // Check if the user already has a business
    const existingBusiness = await this.businessRepository.findOne({
      where: { user_id: createBusinessDto.user_id },
    });

    if (existingBusiness) {
      throw new ConflictException(
        `User with ID ${createBusinessDto.user_id} already has a registered business`,
      );
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create business entity
      const business = new Business();
      business.user_id = createBusinessDto.user_id;
      business.name = createBusinessDto.name;
      business.type = createBusinessDto.type;
      business.description = createBusinessDto.description;
      business.address = createBusinessDto.address;
      if (createBusinessDto.location_id) {
        business.location_id = createBusinessDto.location_id;
      }
      business.city = createBusinessDto.city;
      business.state = createBusinessDto.state;
      business.zip_code = createBusinessDto.zip_code;
      business.phone = createBusinessDto.phone;
      business.email = createBusinessDto.email;
      if (createBusinessDto.image) {
        business.image = createBusinessDto.image;
      }
      business.is_verified = false;

      // Save business
      const savedBusiness = await queryRunner.manager.save(business);

      // Create business hours if provided
      if (createBusinessDto.operating_hours) {
        const businessHours = new BusinessHours();
        businessHours.business_id = savedBusiness.id;
        businessHours.hours = createBusinessDto.operating_hours;
        await queryRunner.manager.save(businessHours);
      }

      await queryRunner.commitTransaction();
      const result = await this.businessRepository.findOne({
        where: { id: savedBusiness.id },
        relations: ['operating_hours'],
      });

      if (!result) {
        throw new Error(
          `Failed to retrieve the created business with ID ${savedBusiness.id}`,
        );
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
