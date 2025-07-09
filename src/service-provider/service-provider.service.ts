import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';

@Injectable()
export class ServiceProviderService {
  constructor(
    @InjectRepository(ServiceProvider)
    private serviceProviderRepository: Repository<ServiceProvider>,
  ) {}

  async create(
    userId: string,
    createServiceProviderDto: CreateServiceProviderDto,
  ): Promise<ServiceProvider> {
    const serviceProvider = this.serviceProviderRepository.create({
      ...createServiceProviderDto,
      user_id: userId,
    });

    return await this.serviceProviderRepository.save(serviceProvider);
  }

  async findAll(): Promise<ServiceProvider[]> {
    return await this.serviceProviderRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<ServiceProvider> {
    const serviceProvider = await this.serviceProviderRepository.findOne({
      where: { id },
      relations: ['user', 'services'],
    });

    if (!serviceProvider) {
      throw new NotFoundException(`Service Provider with ID ${id} not found`);
    }

    return serviceProvider;
  }

  async findByUserId(userId: string): Promise<ServiceProvider | null> {
    const serviceProvider = await this.serviceProviderRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'services'],
    });

    return serviceProvider;
  }

  async updateByUserId(
    userId: string,
    updateServiceProviderDto: UpdateServiceProviderDto,
  ): Promise<ServiceProvider> {
    let serviceProvider = await this.serviceProviderRepository.findOne({
      where: { user_id: userId },
    });

    if (!serviceProvider) {
      // Create service provider profile if doesn't exist
      serviceProvider = this.serviceProviderRepository.create({
        user_id: userId,
        ...updateServiceProviderDto,
      });
    } else {
      // Update existing service provider
      serviceProvider = this.serviceProviderRepository.merge(
        serviceProvider,
        updateServiceProviderDto,
      );
    }

    return await this.serviceProviderRepository.save(serviceProvider);
  }

  async update(
    id: string,
    updateServiceProviderDto: UpdateServiceProviderDto,
  ): Promise<ServiceProvider> {
    const serviceProvider = await this.findOne(id);

    Object.assign(serviceProvider, updateServiceProviderDto);

    return await this.serviceProviderRepository.save(serviceProvider);
  }

  async remove(id: string): Promise<void> {
    const serviceProvider = await this.findOne(id);
    await this.serviceProviderRepository.remove(serviceProvider);
  }

  async incrementServiceCount(userId: string): Promise<void> {
    await this.serviceProviderRepository
      .createQueryBuilder()
      .update(ServiceProvider)
      .set({ total_services: () => 'total_services + 1' })
      .where('user_id = :userId', { userId })
      .execute();
  }

  async updateRating(userId: string, newRating: number): Promise<void> {
    await this.serviceProviderRepository
      .createQueryBuilder()
      .update(ServiceProvider)
      .set({ rating: newRating })
      .where('user_id = :userId', { userId })
      .execute();
  }
}
