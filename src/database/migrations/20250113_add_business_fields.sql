-- Migration: Add business fields to users table
-- Date: 2025-01-13
-- Description: Adds business-specific fields to support the new service provider registration structure

-- Add new business fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_image VARCHAR(500),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS operating_hours JSONB;

-- Update existing service providers with default operating hours if needed
UPDATE users 
SET operating_hours = '{
  "monday": {"open": "08:00", "close": "18:00", "closed": false},
  "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
  "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
  "thursday": {"open": "08:00", "close": "18:00", "closed": false},
  "friday": {"open": "08:00", "close": "18:00", "closed": false},
  "saturday": {"open": "09:00", "close": "17:00", "closed": false},
  "sunday": {"open": "10:00", "close": "16:00", "closed": false}
}'::jsonb
WHERE role = 'service_provider' AND operating_hours IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_business_type ON users(business_type);
CREATE INDEX IF NOT EXISTS idx_users_city_state ON users(city, state);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);

-- Add some sample data for testing (optional - remove in production)
INSERT INTO users (
  id, email, password, first_name, last_name, phone, role, 
  business_name, business_type, business_description, business_address,
  city, state, zip_code, business_phone, business_email, rating, total_reviews,
  operating_hours, latitude, longitude, is_active, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  'info@premiumautospa.com',
  '$2b$10$example_hashed_password',
  'John',
  'Smith',
  '(555) 123-4567',
  'service_provider',
  'Premium Auto Spa',
  'Full Service Car Wash',
  'Professional car wash and detailing services with eco-friendly products. We provide premium care for your vehicle with experienced staff and state-of-the-art equipment.',
  '123 Main Street',
  'Downtown',
  'CA',
  '90210',
  '(555) 123-4567',
  'info@premiumautospa.com',
  4.8,
  156,
  '{
    "monday": {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
    "thursday": {"open": "08:00", "close": "18:00", "closed": false},
    "friday": {"open": "08:00", "close": "19:00", "closed": false},
    "saturday": {"open": "09:00", "close": "17:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": false}
  }'::jsonb,
  34.0522,
  -118.2437,
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

COMMIT;
