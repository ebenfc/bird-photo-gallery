import { db } from "../src/db";
import { users, photos, species, appSettings, haikuboxDetections, haikuboxActivityLog, haikuboxSyncLog } from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";

/**
 * Migration script to assign existing data to a user
 * Usage: npx tsx scripts/migrate-to-multi-user.ts <email>
 */
async function migrateData(userEmail: string) {
  try {
    console.log(`\nMigrating data for user: ${userEmail}\n`);

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!userResult[0]) {
      console.error(`Error: User with email "${userEmail}" not found in database.`);
      console.error("Please sign up through the app first to create the user account.");
      process.exit(1);
    }

    const userId = userResult[0].id;
    console.log(`Found user: ${userResult[0].firstName} ${userResult[0].lastName} (${userId})`);

    // Update photos where userId is null
    console.log("\nMigrating photos...");
    const photosResult = await db
      .update(photos)
      .set({ userId })
      .where(isNull(photos.userId))
      .returning();
    console.log(`✓ Migrated ${photosResult.length} photos`);

    // Update species where userId is null
    console.log("\nMigrating species...");
    const speciesResult = await db
      .update(species)
      .set({ userId })
      .where(isNull(species.userId))
      .returning();
    console.log(`✓ Migrated ${speciesResult.length} species`);

    // Update app settings where userId is null
    console.log("\nMigrating app settings...");
    const settingsResult = await db
      .update(appSettings)
      .set({ userId })
      .where(isNull(appSettings.userId))
      .returning();
    console.log(`✓ Migrated ${settingsResult.length} settings`);

    // Update haikubox detections where userId is null
    console.log("\nMigrating haikubox detections...");
    const detectionsResult = await db
      .update(haikuboxDetections)
      .set({ userId })
      .where(isNull(haikuboxDetections.userId))
      .returning();
    console.log(`✓ Migrated ${detectionsResult.length} haikubox detections`);

    // Update haikubox activity log where userId is null
    console.log("\nMigrating haikubox activity logs...");
    const activityResult = await db
      .update(haikuboxActivityLog)
      .set({ userId })
      .where(isNull(haikuboxActivityLog.userId))
      .returning();
    console.log(`✓ Migrated ${activityResult.length} activity log entries`);

    // Update haikubox sync log where userId is null
    console.log("\nMigrating haikubox sync logs...");
    const syncLogResult = await db
      .update(haikuboxSyncLog)
      .set({ userId })
      .where(isNull(haikuboxSyncLog.userId))
      .returning();
    console.log(`✓ Migrated ${syncLogResult.length} sync log entries`);

    console.log("\n✅ Migration completed successfully!");
    console.log("\nSummary:");
    console.log(`  Photos: ${photosResult.length}`);
    console.log(`  Species: ${speciesResult.length}`);
    console.log(`  Settings: ${settingsResult.length}`);
    console.log(`  Haikubox Detections: ${detectionsResult.length}`);
    console.log(`  Activity Logs: ${activityResult.length}`);
    console.log(`  Sync Logs: ${syncLogResult.length}`);
    console.log();

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/migrate-to-multi-user.ts <email>");
  console.error("Example: npx tsx scripts/migrate-to-multi-user.ts user@example.com");
  process.exit(1);
}

// Run migration
migrateData(email);
