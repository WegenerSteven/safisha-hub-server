import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ServiceProviderDashboardService } from './service-provider-dashboard.service';
import { ServiceProviderDashboardController } from './service-provider-dashboard.controller';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { DatabaseModule } from 'src/database/database.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User, Service, Booking]),
    FileUploadModule,
  ],
  controllers: [UsersController, ServiceProviderDashboardController],
  providers: [UsersService, ServiceProviderDashboardService],
  exports: [UsersService, ServiceProviderDashboardService],
})
export class UsersModule {}
