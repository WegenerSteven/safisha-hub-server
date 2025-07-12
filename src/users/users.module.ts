import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ProfileManagementService } from './profile-management.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'src/database/database.module';
import { CustomersModule } from '../customers/customers.module';
import { ServiceProviderModule } from '../service-provider/service-provider.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    CustomersModule,
    ServiceProviderModule,
    FileUploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ProfileManagementService],
  exports: [UsersService, ProfileManagementService],
})
export class UsersModule {}
