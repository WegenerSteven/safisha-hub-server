import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyUserTables1705071600000 implements MigrationInterface {
  name = 'UnifyUserTables1705071600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add new columns to users table for role-specific data
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'CUSTOMER',
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Kenya',
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS preferences JSONB,
      ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS business_description TEXT,
      ADD COLUMN IF NOT EXISTS business_license VARCHAR(255),
      ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS service_areas TEXT[],
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
      ADD COLUMN IF NOT EXISTS operating_hours JSONB,
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
      ADD COLUMN IF NOT EXISTS certifications TEXT[],
      ADD COLUMN IF NOT EXISTS insurance_details JSONB,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_documents JSONB,
      ADD COLUMN IF NOT EXISTS business_registration_date DATE,
      ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2)
    `);

    // Step 2: Create indexes for performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_business_name ON users(business_name) WHERE business_name IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified) WHERE role = 'SERVICE_PROVIDER'`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_city_role ON users(city, role)`,
    );

    // Step 3: Add constraints
    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_users_role CHECK (role IN ('CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'))
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_rating_range CHECK (rating >= 0 AND rating <= 5)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_latitude_range CHECK (latitude >= -90 AND latitude <= 90)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_longitude_range CHECK (longitude >= -180 AND longitude <= 180)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 100)
    `);

    console.log('Database migration completed successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns and constraints
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_commission_rate`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_longitude_range`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_latitude_range`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_rating_range`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_city_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_verified`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_business_name`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role`);

    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS commission_rate,
      DROP COLUMN IF EXISTS subscription_type,
      DROP COLUMN IF EXISTS business_registration_date,
      DROP COLUMN IF EXISTS verification_documents,
      DROP COLUMN IF EXISTS is_verified,
      DROP COLUMN IF EXISTS insurance_details,
      DROP COLUMN IF EXISTS certifications,
      DROP COLUMN IF EXISTS years_of_experience,
      DROP COLUMN IF EXISTS total_reviews,
      DROP COLUMN IF EXISTS rating,
      DROP COLUMN IF EXISTS operating_hours,
      DROP COLUMN IF EXISTS longitude,
      DROP COLUMN IF EXISTS latitude,
      DROP COLUMN IF EXISTS service_areas,
      DROP COLUMN IF EXISTS business_email,
      DROP COLUMN IF EXISTS business_phone,
      DROP COLUMN IF EXISTS website_url,
      DROP COLUMN IF EXISTS tax_id,
      DROP COLUMN IF EXISTS business_license,
      DROP COLUMN IF EXISTS business_description,
      DROP COLUMN IF EXISTS business_name,
      DROP COLUMN IF EXISTS average_rating,
      DROP COLUMN IF EXISTS total_bookings,
      DROP COLUMN IF EXISTS loyalty_points,
      DROP COLUMN IF EXISTS preferences,
      DROP COLUMN IF EXISTS emergency_contact_phone,
      DROP COLUMN IF EXISTS emergency_contact_name,
      DROP COLUMN IF EXISTS postal_code,
      DROP COLUMN IF EXISTS country,
      DROP COLUMN IF EXISTS state,
      DROP COLUMN IF EXISTS city,
      DROP COLUMN IF EXISTS address,
      DROP COLUMN IF EXISTS gender,
      DROP COLUMN IF EXISTS date_of_birth,
      DROP COLUMN IF EXISTS phone,
      DROP COLUMN IF EXISTS role
    `);
  }
}
