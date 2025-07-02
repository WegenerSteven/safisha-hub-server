import { PartialType } from '@nestjs/mapped-types';
import { CreateSMSDto } from './create-sms.dto';

export class UpdateSMSDto extends PartialType(CreateSMSDto) {}
