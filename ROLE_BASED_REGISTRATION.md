# Role-Based User Registration System

## Overview

This document outlines the redesigned database schema and backend logic for the SafishaHub car wash management system to support role-based user registration where user data is saved in both the users table and appropriate role-specific tables.

## Database Schema Changes

### 1. Users Table (Core User Data)
The users table remains the central table for authentication and basic user information:
- `id` (UUID) - Primary key
- `email` (varchar) - Unique email address
- `password` (varchar) - Hashed password
- `first_name` (varchar) - First name
- `last_name` (varchar) - Last name
- `phone` (varchar) - Phone number
- `role` (enum) - User role (customer, provider, admin)
- `is_active` (boolean) - Account status
- `email_verified_at` (timestamp) - Email verification
- `created_at` (timestamp) - Creation time
- `updated_at` (timestamp) - Last update time

### 2. Customers Table (Customer-Specific Data)
New table for customer-specific information:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `address` (text) - Home address
- `date_of_birth` (date) - Date of birth
- `preferred_contact_method` (varchar) - Communication preference
- `email_notifications` (boolean) - Email notification preference
- `sms_notifications` (boolean) - SMS notification preference
- `total_bookings` (integer) - Total number of bookings
- `total_spent` (decimal) - Total amount spent
- `loyalty_tier` (varchar) - Loyalty program tier
- `loyalty_points` (integer) - Loyalty points balance
- `created_at` (timestamp) - Creation time
- `updated_at` (timestamp) - Last update time

### 3. Service Providers Table (Provider-Specific Data)
Enhanced table for service provider information:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `business_name` (varchar) - Business name
- `description` (text) - Business description
- `address` (text) - Business address
- `phone` (varchar) - Business phone
- `rating` (decimal) - Average rating
- `total_services` (integer) - Total services provided
- `is_verified` (boolean) - Verification status
- `created_at` (timestamp) - Creation time
- `updated_at` (timestamp) - Last update time

## Entity Relationships

### User Entity
```typescript
@Entity('users')
export class User {
  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @OneToMany(() => ServiceProvider, (provider) => provider.user)
  service_providers: ServiceProvider[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
  // ... other relationships
}
```

### Customer Entity
```typescript
@Entity('customers')
export class Customer {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];
  // ... other fields
}
```

### Booking Entity (Updated)
```typescript
@Entity('bookings')
export class Booking {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  customer: Customer;
  // ... other fields
}
```

## Registration Flow

### 1. Registration DTO
```typescript
export class RegisterUserDto {
  // Basic user fields
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role; // Required - customer, provider, admin

  // Role-specific data
  customer_data?: CustomerRegistrationData;
  provider_data?: ServiceProviderRegistrationData;
}
```

### 2. Customer Registration Data
```typescript
export class CustomerRegistrationData {
  address?: string;
  date_of_birth?: string;
  preferred_contact_method?: 'email' | 'sms' | 'phone';
  email_notifications?: boolean;
  sms_notifications?: boolean;
}
```

### 3. Service Provider Registration Data
```typescript
export class ServiceProviderRegistrationData {
  business_name: string; // Required
  description?: string;
  address: string; // Required
  phone?: string;
}
```

## Registration Process

### 1. Database Transaction
The registration process uses database transactions to ensure data consistency:

```typescript
async register(registerUserDto: RegisterUserDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Create user in users table
    const user = await queryRunner.manager.save(User, userData);

    // 2. Create role-specific profile
    let profile = null;
    if (role === Role.CUSTOMER) {
      profile = await this.customersService.create(user.id, customer_data);
    } else if (role === Role.PROVIDER) {
      profile = await this.serviceProviderService.create(user.id, provider_data);
    }

    await queryRunner.commitTransaction();
    return { user, profile };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  }
}
```

### 2. Role-Specific Profile Creation
- **Customer Registration**: Creates entry in customers table with preferences
- **Service Provider Registration**: Creates entry in service_providers table with business info
- **Admin Registration**: (To be implemented) Creates admin-specific profile

## API Endpoints

### Registration Endpoints
```http
POST /api/users/register
```

**Customer Registration Example:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "phone": "+254712345678",
  "role": "customer",
  "customer_data": {
    "address": "123 Main St, Nairobi",
    "preferred_contact_method": "email",
    "email_notifications": true,
    "sms_notifications": false
  }
}
```

**Service Provider Registration Example:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+254712345679",
  "role": "provider",
  "provider_data": {
    "business_name": "John's Car Wash",
    "description": "Professional car wash services",
    "address": "456 Business Ave, Nairobi",
    "phone": "+254712345679"
  }
}
```

### Profile Endpoints
```http
GET /api/users/profile/{userId}  # Get user with role-specific profile
GET /api/customers/user/{userId}  # Get customer profile only
GET /api/service-provider/user/{userId}  # Get provider profile only
```

## Frontend Sync Requirements

### Registration Form
1. **Role Selection**: User must select role before showing role-specific fields
2. **Conditional Fields**: Show customer or provider fields based on selection
3. **Validation**: Ensure required fields are filled based on role
4. **Error Handling**: Display role-specific validation errors

### Profile Management
1. **Unified Profile View**: Show both user and role-specific data
2. **Role-Based Editing**: Allow editing of appropriate fields based on role
3. **Profile Completion**: Guide users to complete missing profile information

## Migration Strategy

### 1. Database Migration
```sql
-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  address TEXT,
  date_of_birth DATE,
  -- ... other fields
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_loyalty_tier ON customers(loyalty_tier);
```

### 2. Data Migration (if needed)
For existing users, create default profiles:
```sql
-- Create customer profiles for existing customer users
INSERT INTO customers (user_id, email_notifications, sms_notifications, preferred_contact_method)
SELECT id, true, true, 'email'
FROM users 
WHERE role = 'customer' 
AND id NOT IN (SELECT user_id FROM customers);
```

## Benefits

1. **Data Integrity**: Transactional registration ensures consistency
2. **Flexible Profiles**: Role-specific data without bloating users table
3. **Scalability**: Easy to add new roles and role-specific fields
4. **Performance**: Proper indexing and relationships
5. **Maintainability**: Clear separation of concerns

## Implementation Status

✅ **Completed:**
- Customer entity and service
- Service provider entity updates
- Registration DTO with role-specific data
- Database transaction registration
- Profile retrieval with role-specific data
- API endpoints for registration and profile
- Database migration files

🔄 **In Progress:**
- Frontend sync requirements
- Profile update functionality
- Role-based access control

⏳ **Pending:**
- Admin role implementation
- Profile completion workflows
- Advanced loyalty program features

## Testing

Use the provided app.http file to test:
1. Customer registration with various data combinations
2. Service provider registration
3. Profile retrieval
4. Error handling for missing required fields

This implementation ensures that the backend and frontend remain in sync while providing a robust, scalable solution for role-based user management.
