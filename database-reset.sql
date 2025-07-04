-- Database Reset Script for SafishaHub
-- Run this script to clean up the database and resolve foreign key conflicts

-- Drop the specific problematic constraint if it exists
ALTER TABLE IF EXISTS "bookings" DROP CONSTRAINT IF EXISTS "FK_64cd97487c5c42806458ab5520c";

-- Drop all tables in the correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS "booking_addons" CASCADE;
DROP TABLE IF EXISTS "service_addons" CASCADE;
DROP TABLE IF EXISTS "bookings" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "service_providers" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "email_services" CASCADE;
DROP TABLE IF EXISTS "sms" CASCADE;
DROP TABLE IF EXISTS "analytics" CASCADE;
DROP TABLE IF EXISTS "locations" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Optional: If you want to completely reset the database
-- DROP DATABASE IF EXISTS safishahub_dev;
-- CREATE DATABASE safishahub_dev;

-- Note: After running this script, restart your NestJS application
-- The synchronize feature will recreate all tables with the correct structure
