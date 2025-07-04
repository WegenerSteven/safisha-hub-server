import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(
    userId: string,
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      user_id: userId,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByUserId(userId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer for user ID ${userId} not found`);
    }

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    Object.assign(customer, updateCustomerDto);

    return await this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async incrementBookingCount(userId: string): Promise<void> {
    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set({ total_bookings: () => 'total_bookings + 1' })
      .where('user_id = :userId', { userId })
      .execute();
  }

  async addSpent(userId: string, amount: number): Promise<void> {
    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set({
        total_spent: () => `total_spent + ${amount}`,
        loyalty_points: () => `loyalty_points + ${Math.floor(amount / 10)}`, // 1 point per 10 currency units
      })
      .where('user_id = :userId', { userId })
      .execute();
  }
}
