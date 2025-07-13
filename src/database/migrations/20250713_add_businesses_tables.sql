-- Create businesses table
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  type varchar(100) NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  location_id uuid REFERENCES locations(id),
  city varchar(100) NOT NULL,
  state varchar(100) NOT NULL,
  zip_code varchar(20) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(255) NOT NULL,
  image varchar(500),
  rating decimal(3,2) DEFAULT 0.0,
  total_services integer DEFAULT 0,
  total_reviews integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  latitude decimal(10,8),
  longitude decimal(11,8),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing service providers to businesses table
INSERT INTO businesses (
  user_id,
  name,
  type,
  description,
  address,
  city,
  state,
  zip_code,
  phone,
  email,
  image,
  rating,
  total_services,
  total_reviews,
  is_verified,
  latitude,
  longitude,
  created_at,
  updated_at
)
SELECT
  id as user_id,
  business_name as name,
  business_type as type,
  COALESCE(business_description, 'Car washing and detailing services') as description,
  COALESCE(business_address, '') as address,
  COALESCE(city, '') as city,
  COALESCE(state, '') as state,
  COALESCE(zip_code, '') as zip_code,
  COALESCE(business_phone, phone) as phone,
  COALESCE(business_email, email) as email,
  business_image as image,
  rating,
  total_services,
  total_reviews,
  is_verified,
  latitude,
  longitude,
  created_at,
  updated_at
FROM users
WHERE role = 'service_provider' AND business_name IS NOT NULL;

-- Create business_hours table
CREATE TABLE business_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  hours jsonb NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing service provider hours to business_hours table
INSERT INTO business_hours (
  business_id,
  hours,
  created_at,
  updated_at
)
SELECT
  b.id as business_id,
  u.operating_hours as hours,
  b.created_at,
  b.updated_at
FROM users u
JOIN businesses b ON u.id = b.user_id
WHERE u.role = 'service_provider' AND u.operating_hours IS NOT NULL;

-- Add business_id to services table
ALTER TABLE services ADD COLUMN business_id uuid REFERENCES businesses(id) ON DELETE CASCADE;
CREATE INDEX idx_services_business ON services(business_id);

-- Create unique index to ensure one business per user
CREATE UNIQUE INDEX idx_businesses_user_id ON businesses(user_id);

-- Comment to explain the relationship
COMMENT ON COLUMN services.business_id IS 'Reference to the business providing this service. Can be used instead of provider_id for service providers that register as businesses.';

-- Update existing services to link to business
UPDATE services s
SET business_id = b.id
FROM businesses b
JOIN users u ON b.user_id = u.id
WHERE s.provider_id = u.id;

-- Add a function to automatically set business_id when a service is created
CREATE OR REPLACE FUNCTION set_business_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_id IS NULL THEN
    NEW.business_id := (
      SELECT b.id
      FROM businesses b
      JOIN users u ON b.user_id = u.id
      WHERE u.id = NEW.provider_id
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_business_id
BEFORE INSERT OR UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION set_business_id();
