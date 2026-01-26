import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Get a setting value by key
 */
export async function getSetting(userId: string, key: string): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(appSettings)
      .where(and(
        eq(appSettings.userId, userId),
        eq(appSettings.key, key)
      ))
      .limit(1);

    return result[0]?.value ?? null;
  } catch (error) {
    console.error(`Failed to get setting: ${key}`, error);
    return null;
  }
}

/**
 * Set a setting value (upsert)
 */
export async function setSetting(userId: string, key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ userId, key, value })
    .onConflictDoUpdate({
      target: [appSettings.userId, appSettings.key],
      set: { value, updatedAt: new Date() },
    });
}

/**
 * Get Haikubox serial number from database or fallback to env var
 */
export async function getHaikuboxSerial(userId: string): Promise<string> {
  // Try database first
  const dbSerial = await getSetting(userId, "haikubox_serial");
  if (dbSerial) {
    return dbSerial;
  }

  // Fallback to environment variable
  return process.env.HAIKUBOX_SERIAL || "28372F870638";
}
