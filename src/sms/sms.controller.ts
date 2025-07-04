import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { CreateSMSDto } from './dto/create-sms.dto';
import { UpdateSMSDto } from './dto/update-sms.dto';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  create(@Body() createSmsDto: CreateSMSDto) {
    return this.smsService.create(createSmsDto);
  }

  @Get()
  findAll() {
    return this.smsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmsDto: UpdateSMSDto) {
    return this.smsService.update(+id, updateSmsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smsService.remove(+id);
  }
}
