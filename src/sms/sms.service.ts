import { Injectable } from '@nestjs/common';
import { CreateSMSDto } from './dto/create-sms.dto';
import { UpdateSMSDto } from './dto/update-sms.dto';

@Injectable()
export class SmsService {
  create(CreateSMSDto: CreateSMSDto) {
    return 'This action adds a new sm';
  }

  findAll() {
    return `This action returns all sms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sm`;
  }

  update(id: number, UpdateSMSDto: UpdateSMSDto) {
    return `This action updates a #${id} sm`;
  }

  remove(id: number) {
    return `This action removes a #${id} sm`;
  }
}
