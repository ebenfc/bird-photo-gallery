import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:vHuMgKZftvwEYTpNSpDcdWQhTJQuyWFD@hopper.proxy.rlwy.net:38135/railway'
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create haikubox_detections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "haikubox_detections" (
        "id" serial PRIMARY KEY NOT NULL,
        "species_common_name" text NOT NULL,
        "species_id" integer,
        "yearly_count" integer DEFAULT 0 NOT NULL,
        "last_heard_at" timestamp with time zone,
        "data_year" integer NOT NULL,
        "synced_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('Created haikubox_detections table');

    // Create haikubox_sync_log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "haikubox_sync_log" (
        "id" serial PRIMARY KEY NOT NULL,
        "sync_type" text NOT NULL,
        "status" text NOT NULL,
        "records_processed" integer DEFAULT 0,
        "error_message" text,
        "synced_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('Created haikubox_sync_log table');

    // Add foreign key constraint
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'haikubox_detections_species_id_species_id_fk'
        ) THEN
          ALTER TABLE "haikubox_detections" ADD CONSTRAINT "haikubox_detections_species_id_species_id_fk" 
          FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log('Added foreign key constraint');

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
