import { Injectable } from '@nestjs/common';
import { CreateEmailServiceDto } from './dto/create-email-service.dto';
import { UpdateEmailServiceDto } from './dto/update-email-service.dto';

@Injectable()
export class EmailServiceService {
  create(createEmailServiceDto: CreateEmailServiceDto) {
    return 'This action adds a new emailService';
  }

  findAll() {
    return `This action returns all emailService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} emailService`;
  }

  update(id: number, updateEmailServiceDto: UpdateEmailServiceDto) {
    return `This action updates a #${id} emailService`;
  }

  remove(id: number) {
    return `This action removes a #${id} emailService`;
  }
}
