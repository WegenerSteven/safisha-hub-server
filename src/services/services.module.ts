import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services-new.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { ServiceAddOn } from './entities/service-addon.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServicePricing } from './entities/service-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      ServiceAddOn,
      ServiceCategory,
      ServicePricing,
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService, TypeOrmModule],
})
export class ServicesModule {}
