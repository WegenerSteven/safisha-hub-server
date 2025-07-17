import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateBusinessIdInServices1626345678901
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: First, create the business_id column as nullable
    await queryRunner.query(`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS business_id uuid NULL
    `);

    // Step 2: Create businesses for each provider that has services
    await queryRunner.query(`
      -- Create businesses for each provider with services
      INSERT INTO businesses (id, user_id, name, description, address, phone, email, is_active, created_at, updated_at)
      SELECT 
        uuid_generate_v4() as id, 
        s.provider_id as user_id,
        u.business_name as name, 
        COALESCE(u.business_description, 'Auto-generated business') as description,
        COALESCE(u.business_address, 'Address pending') as address,
        COALESCE(u.business_phone, u.phone) as phone,
        COALESCE(u.business_email, u.email) as email,
        true as is_active,
        NOW() as created_at,
        NOW() as updated_at
      FROM services s
      JOIN users u ON s.provider_id = u.id
      WHERE s.provider_id IS NOT NULL
      GROUP BY s.provider_id, u.business_name, u.business_description, u.business_address, u.business_phone, u.business_email, u.phone, u.email
    `);

    // Step 3: Update services with the new business_id
    await queryRunner.query(`
      UPDATE services s
      SET business_id = (
        SELECT b.id
        FROM businesses b
        WHERE b.user_id = s.provider_id
        LIMIT 1
      )
      WHERE s.provider_id IS NOT NULL
    `);

    // Step 4: Make the business_id column non-nullable after it's been populated
    await queryRunner.query(`
      ALTER TABLE services
      ALTER COLUMN business_id SET NOT NULL
    `);

    // Step 5: Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE services
      ADD CONSTRAINT fk_service_business
      FOREIGN KEY (business_id)
      REFERENCES businesses(id)
      ON DELETE CASCADE
    `);

    // Step 6: Optionally remove provider_id column after migration is complete
    await queryRunner.query(`
      ALTER TABLE services
      DROP COLUMN IF EXISTS provider_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes if needed
    await queryRunner.query(`
      ALTER TABLE services
      ADD COLUMN provider_id uuid NULL
    `);

    await queryRunner.query(`
      UPDATE services s
      SET provider_id = (
        SELECT b.user_id
        FROM businesses b
        WHERE b.id = s.business_id
      )
    `);

    await queryRunner.query(`
      ALTER TABLE services
      DROP CONSTRAINT fk_service_business
    `);

    await queryRunner.query(`
      ALTER TABLE services
      DROP COLUMN business_id
    `);
  }
}
