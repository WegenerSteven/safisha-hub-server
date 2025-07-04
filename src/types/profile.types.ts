import { Customer } from './../customers/entities/customer.entity';
import { ServiceProvider } from './../service-provider/entities/service-provider.entity';
import { User, Role } from './../users/entities/user.entity';

// Base interface
interface BaseUserProfile {
  user: Partial<User>;
}
export interface UserWithProfile<T = Customer | ServiceProvider | null> {
  user: Partial<User>;
  profile: T;
}

// Discriminated union for different profile types
export interface CustomerUserProfile extends BaseUserProfile {
  user: Partial<User> & { role: Role.CUSTOMER };
  profile: Customer;
}

export interface ServiceProviderUserProfile extends BaseUserProfile {
  user: Partial<User> & { role: Role.SERVICE_PROVIDER };
  profile: ServiceProvider;
}

export interface AdminUserProfile extends BaseUserProfile {
  user: Partial<User> & { role: Role.ADMIN };
  profile: null;
}

// Union type for all possible profile combinations
export type UserProfileResponse =
  | CustomerUserProfile
  | ServiceProviderUserProfile
  | AdminUserProfile;
// For registration responses where profile is guaranteed to exist
export type UserRegistrationResponse =
  | CustomerUserProfile
  | ServiceProviderUserProfile;
