import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async findByUserId(userId: string) {
    return this.paymentRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      relations: ['booking', 'user'],
    });
  }

  async findAll() {
    return this.paymentRepository.find();
  }

  async findOne(id: string) {
    return this.paymentRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    await this.paymentRepository.update(id, updatePaymentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.paymentRepository.delete(id);
  }
}
