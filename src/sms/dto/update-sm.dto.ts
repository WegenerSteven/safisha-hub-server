import { PartialType } from '@nestjs/mapped-types';
import { CreateSMSDto } from './create-sm.dto';

export class UpdateSMSDto extends PartialType(CreateSMSDto) {}
