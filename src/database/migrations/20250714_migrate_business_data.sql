-- Migration script to move business data from users table to businesses table
-- Run this script after creating the new business tables

-- Step 1: Create businesses from service provider users
INSERT INTO businesses (
  name,
  description,
  type,
  address,
  city,
  state,
  postal_code,
  phone,
  email,
  website,
  user_id,
  created_at,
  updated_at
)
SELECT
  business_name,
  COALESCE(business_description, 'Car washing and detailing services') as description,
  COALESCE(business_type, 'Car Wash Service') as type,
  business_address,
  city,
  state,
  zip_code,
  COALESCE(business_phone, phone) as phone,
  COALESCE(business_email, email) as email,
  '' as website,
  id as user_id,
  NOW() as created_at,
  NOW() as updated_at
FROM users
WHERE role = 'service_provider'
AND business_name IS NOT NULL;

-- Step 2: Create business_hours for each business
INSERT INTO business_hours (
  business_id,
  hours,
  created_at,
  updated_at
)
SELECT
  b.id,
  CASE
    WHEN u.operating_hours IS NOT NULL THEN u.operating_hours
    ELSE '{
      "monday": {"open": "08:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
      "thursday": {"open": "08:00", "close": "18:00", "closed": false},
      "friday": {"open": "08:00", "close": "18:00", "closed": false},
      "saturday": {"open": "09:00", "close": "17:00", "closed": false},
      "sunday": {"open": "10:00", "close": "16:00", "closed": true}
    }'::jsonb
  END as hours,
  NOW() as created_at,
  NOW() as updated_at
FROM businesses b
JOIN users u ON b.user_id = u.id;

-- Step 3: Update services to reference the business
UPDATE services s
SET business_id = b.id
FROM businesses b
JOIN users u ON b.user_id = u.id
WHERE s.user_id = u.id;

-- Step 4: Create trigger to automatically link services to businesses

-- First, create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION link_service_to_business()
RETURNS TRIGGER AS $$
BEGIN
  -- If business_id is not set and user_id is a service provider
  IF NEW.business_id IS NULL AND NEW.user_id IS NOT NULL THEN
    -- Find the business for this user and link it
    NEW.business_id := (SELECT id FROM businesses WHERE user_id = NEW.user_id LIMIT 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER service_business_link_trigger
BEFORE INSERT OR UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION link_service_to_business();
