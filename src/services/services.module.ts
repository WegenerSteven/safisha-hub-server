import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { ServiceAddOn } from './entities/service-addon.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServicePricing } from './entities/service-pricing.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { BusinessesModule } from '../businesses/businesses.module';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      ServiceAddOn,
      ServiceCategory,
      ServicePricing,
      User,
      Business,
      FileUploadService,
    ]),
    BusinessesModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService, TypeOrmModule],
})
export class ServicesModule {}
