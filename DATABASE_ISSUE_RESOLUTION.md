# Database Constraint Conflict Resolution

## Problem
You encountered this error:
```
QueryFailedError: constraint "FK_64cd97487c5c42806458ab5520c" for relation "bookings" already exists
```

## Root Cause
The error occurred because:
1. We added a new relationship between bookings and customers tables
2. TypeORM tried to create a foreign key constraint that already existed
3. This happens when synchronize=true and there are existing conflicting constraints

## Solutions

### Option 1: Quick Reset (Recommended for Development)

1. **Stop your NestJS application** (Ctrl+C)

2. **Run the database reset script:**
   ```bash
   # Connect to PostgreSQL and run:
   psql -U your_username -d your_database_name -f database-reset.sql
   
   # OR if using different connection method:
   psql postgres://username:password@localhost:5432/database_name -f database-reset.sql
   ```

3. **Restart your application:**
   ```bash
   npm run start:dev
   ```

### Option 2: Manual Constraint Removal

If you prefer not to reset the entire database:

1. **Connect to your PostgreSQL database**
2. **Run this command:**
   ```sql
   ALTER TABLE bookings DROP CONSTRAINT IF EXISTS FK_64cd97487c5c42806458ab5520c;
   ```
3. **Restart your NestJS application**

### Option 3: Disable Synchronize (Production Approach)

1. **Update your database configuration:**
   ```typescript
   // In database.module.ts or .env
   synchronize: false, // Set to false
   ```

2. **Create and run migrations instead:**
   ```bash
   npm run migration:generate -- --name=UpdateBookingsRelation
   npm run migration:run
   ```

## Changes Made to Fix the Issue

### 1. Removed Duplicate Relationship
**Before (Problematic):**
```typescript
@Entity('bookings')
export class Booking {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.bookings)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  customer: Customer; // This caused the conflict
}
```

**After (Fixed):**
```typescript
@Entity('bookings')
export class Booking {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
  // Removed direct customer relationship
}
```

### 2. Simplified Customer Entity
**Before:**
```typescript
@Entity('customers')
export class Customer {
  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];
}
```

**After:**
```typescript
@Entity('customers')
export class Customer {
  // Removed direct bookings relationship
  // Access bookings through user.bookings instead
}
```

## How to Access Customer Bookings Now

Instead of `customer.bookings`, use:

```typescript
// In your service:
async getCustomerBookings(userId: string) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['bookings', 'customers']
  });
  
  return user.bookings; // Access bookings through user
}

// Or query directly:
async getCustomerBookings(userId: string) {
  return await this.bookingRepository.find({
    where: { user_id: userId },
    relations: ['service', 'user']
  });
}
```

## Verification Steps

After fixing the issue:

1. **Test Registration:**
   ```bash
   # Use the app.http file to test:
   POST http://localhost:3000/api/users/register
   ```

2. **Verify Database Structure:**
   ```sql
   -- Check that tables are created correctly:
   \dt  -- List all tables
   \d bookings  -- Describe bookings table
   \d customers  -- Describe customers table
   ```

3. **Test the API endpoints:**
   ```bash
   # Test customer registration
   POST /api/users/register (with role: "customer")
   
   # Test provider registration  
   POST /api/users/register (with role: "provider")
   
   # Test profile retrieval
   GET /api/users/profile/{userId}
   ```

## Prevention for Future

1. **Use migrations instead of synchronize in production**
2. **Test schema changes in development first**
3. **Always backup database before major changes**
4. **Use proper foreign key naming conventions**

The issue has been resolved by simplifying the entity relationships and removing the conflicting constraint.
