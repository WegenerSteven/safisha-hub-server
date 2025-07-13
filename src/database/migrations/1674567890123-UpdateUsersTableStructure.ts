import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUsersTableStructure1674567890123
  implements MigrationInterface
{
  name = 'UpdateUsersTableStructure1674567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the service_providers and customers tables
    await queryRunner.query(`DROP TABLE IF EXISTS "service_providers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers" CASCADE`);

    // Add new columns to users table for customer-specific data
    await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "date_of_birth" date`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "preferred_contact_method" varchar(20) DEFAULT 'email'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email_notifications" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "sms_notifications" boolean DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "total_bookings" integer DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "total_spent" decimal(10,2) DEFAULT 0.0`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "loyalty_tier" varchar(50) DEFAULT 'bronze'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "loyalty_points" integer DEFAULT 0`,
    );

    // Add new columns to users table for service provider-specific data
    await queryRunner.query(
      `ALTER TABLE "users" ADD "business_name" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "business_description" text`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "business_address" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "business_phone" varchar(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "rating" decimal(3,2) DEFAULT 0.0`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "total_services" integer DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_verified" boolean DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "latitude" decimal(10,8)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "longitude" decimal(11,8)`,
    );

    // Update services table to reference users directly instead of service_providers
    await queryRunner.query(
      `ALTER TABLE "services" RENAME COLUMN "provider_id" TO "provider_id_temp"`,
    );
    await queryRunner.query(`ALTER TABLE "services" ADD "provider_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_services_provider" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    // Drop the old foreign key constraint and column
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "provider_id_temp"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_services_provider"`,
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "provider_id"`);

    // Remove added columns from users table
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "longitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_verified"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "total_services"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "rating"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_phone"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "business_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "business_description"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loyalty_points"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "loyalty_tier"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "total_spent"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "total_bookings"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "sms_notifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "email_notifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "preferred_contact_method"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date_of_birth"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);

    // Recreate the service_providers and customers tables would require additional migration
    // This is a simplified rollback
  }
}
