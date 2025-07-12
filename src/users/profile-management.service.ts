import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ServiceProvider } from '../service-provider/entities/service-provider.entity';
import { CustomersService } from '../customers/customers.service';
import { ServiceProviderService } from '../service-provider/service-provider.service';
import { UsersService } from '../users/users.service';

export interface UnifiedProfileResponse {
  user: Partial<User>;
  profile: Customer | ServiceProvider | null;
  profileType: 'customer' | 'service_provider' | 'admin';
}

@Injectable()
export class ProfileManagementService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UsersService,
    private customersService: CustomersService,
    private serviceProviderService: ServiceProviderService,
  ) {}

  async getUnifiedProfile(userId: string): Promise<UnifiedProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile: Customer | ServiceProvider | null = null;
    let profileType: 'customer' | 'service_provider' | 'admin';

    // Get role-specific profile
    if (user.role === Role.CUSTOMER) {
      profile = await this.customersService.findByUserId(userId);
      profileType = 'customer';
    } else if (user.role === Role.SERVICE_PROVIDER) {
      profile = await this.serviceProviderService.findByUserId(userId);
      profileType = 'service_provider';
    } else {
      profileType = 'admin';
    }

    // Remove sensitive data
    const { password, hashedRefreshToken, ...userResponse } = user;

    return {
      user: userResponse,
      profile,
      profileType,
    };
  }

  async ensureProfileExists(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create profile if it doesn't exist
    if (user.role === Role.CUSTOMER) {
      const existingProfile = await this.customersService.findByUserId(userId);
      if (!existingProfile) {
        await this.customersService.create(userId, {
          email_notifications: true,
          sms_notifications: true,
          preferred_contact_method: 'email',
        });
      }
    } else if (user.role === Role.SERVICE_PROVIDER) {
      const existingProfile =
        await this.serviceProviderService.findByUserId(userId);
      if (!existingProfile) {
        throw new BadRequestException(
          'Service provider profile must be created with business information',
        );
      }
    }
  }

  async updateUnifiedProfile(
    userId: string,
    userData?: Partial<User>,
    profileData?: any,
  ): Promise<UnifiedProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update basic user data
    if (userData) {
      await this.usersService.updateUserProfile(userId, userData);
    }

    // Update role-specific profile
    if (profileData) {
      if (user.role === Role.CUSTOMER) {
        await this.customersService.updateByUserId(userId, profileData);
      } else if (user.role === Role.SERVICE_PROVIDER) {
        await this.serviceProviderService.updateByUserId(userId, profileData);
      }
    }

    return this.getUnifiedProfile(userId);
  }
}
