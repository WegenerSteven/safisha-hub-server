import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { BusinessHours } from './entities/business-hours.entity';
import { UsersModule } from '../users/users.module';
import { LocationsModule } from '../location/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessHours]),
    UsersModule,
    LocationsModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
