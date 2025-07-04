import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomersTable1672531200000 implements MigrationInterface {
  name = 'CreateCustomersTable1672531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create customers table
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "address" text,
        "date_of_birth" date,
        "preferred_contact_method" character varying(20),
        "email_notifications" boolean NOT NULL DEFAULT true,
        "sms_notifications" boolean NOT NULL DEFAULT true,
        "total_bookings" integer NOT NULL DEFAULT 0,
        "total_spent" numeric(10,2) NOT NULL DEFAULT 0.0,
        "loyalty_tier" character varying(50) NOT NULL DEFAULT 'bronze',
        "loyalty_points" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customers_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_customers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_customers_user_id" ON "customers" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_loyalty_tier" ON "customers" ("loyalty_tier")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_total_spent" ON "customers" ("total_spent")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_customers_total_spent"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_loyalty_tier"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_user_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}
