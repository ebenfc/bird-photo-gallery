import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { haikuboxDetections, haikuboxSyncLog, species } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  fetchYearlyDetections,
  fetchRecentDetections,
  normalizeCommonName,
} from "@/lib/haikubox";
import { storeActivityLogs, cleanupOldActivityLogs } from "@/lib/activity";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError, logInfo } from "@/lib/logger";
import { invalidateHaikuboxCache } from "@/lib/cache";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// POST /api/haikubox/sync - Sync Haikubox data to database
// Can be triggered by Vercel Cron or manually
export async function POST(request: NextRequest) {
  // Rate limiting - sync operations are expensive
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.sync);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const currentYear = new Date().getFullYear();

    // 1. Fetch yearly data from Haikubox
    const yearlyData = await fetchYearlyDetections(userId, currentYear);

    if (!yearlyData || yearlyData.length === 0) {
      await logSync(userId, "yearly", "error", 0, "No data returned from Haikubox API");
      return NextResponse.json(
        { error: "No data returned from Haikubox API" },
        { status: 502 }
      );
    }

    // 2. Fetch recent detections for "last heard" timestamps
    const recentData = await fetchRecentDetections(userId, 72); // Last 3 days

    // 3. Build lookup map for recent detections (most recent timestamp per species)
    const recentMap = new Map<string, Date>();
    for (const detection of recentData) {
      const normalized = normalizeCommonName(detection.species);
      const timestamp = new Date(detection.timestamp);
      const existing = recentMap.get(normalized);
      if (!existing || timestamp > existing) {
        recentMap.set(normalized, timestamp);
      }
    }

    // 4. Get all gallery species for matching
    const gallerySpecies = await db
      .select()
      .from(species)
      .where(eq(species.userId, userId));
    const speciesMap = new Map(
      gallerySpecies.map((s) => [normalizeCommonName(s.commonName), s.id])
    );

    // 5. Store individual activity logs for timeline feature
    const activityLogsStored = await storeActivityLogs(userId, recentData, speciesMap);
    console.log(`Stored ${activityLogsStored} activity log entries`);

    // 5a. Cleanup old activity logs (90-day retention)
    const cleaned = await cleanupOldActivityLogs(userId, 90);
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} old activity log entries`);
    }

    // 6. Upsert detection records
    let processed = 0;
    for (const detection of yearlyData) {
      const birdName = detection.bird;
      const normalized = normalizeCommonName(birdName);
      const matchedSpeciesId = speciesMap.get(normalized) || null;
      const lastHeard = recentMap.get(normalized) || null;

      // Check if record exists for this species/year/user
      const existing = await db
        .select()
        .from(haikuboxDetections)
        .where(
          and(
            eq(haikuboxDetections.userId, userId),
            eq(haikuboxDetections.speciesCommonName, birdName),
            eq(haikuboxDetections.dataYear, currentYear)
          )
        )
        .limit(1);

      const existingRecord = existing[0];
      if (existingRecord) {
        // Update existing record
        await db
          .update(haikuboxDetections)
          .set({
            yearlyCount: detection.count,
            speciesId: matchedSpeciesId,
            lastHeardAt: lastHeard,
            syncedAt: new Date(),
          })
          .where(eq(haikuboxDetections.id, existingRecord.id));
      } else {
        // Insert new record
        await db.insert(haikuboxDetections).values({
          userId,
          speciesCommonName: birdName,
          speciesId: matchedSpeciesId,
          yearlyCount: detection.count,
          lastHeardAt: lastHeard,
          dataYear: currentYear,
        });
      }
      processed++;
    }

    // 7. Log successful sync
    await logSync(userId, "yearly", "success", processed);

    // Invalidate cache
    invalidateHaikuboxCache();

    logInfo("Haikubox sync completed", { processed, year: currentYear });

    const response = NextResponse.json({
      success: true,
      processed,
      year: currentYear,
      matched: gallerySpecies.length,
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.sync);
  } catch (error) {
    logError("Haikubox sync error", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/haikubox/sync",
      method: "POST"
    });

    // Log failed sync
    const authResult2 = await requireAuth();
    if (!isErrorResponse(authResult2)) {
      await logSync(
        authResult2.userId,
        "yearly",
        "error",
        0,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}

// GET /api/haikubox/sync - Get sync status
export async function GET(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const lastSync = await db
      .select()
      .from(haikuboxSyncLog)
      .where(eq(haikuboxSyncLog.userId, userId))
      .orderBy(desc(haikuboxSyncLog.syncedAt))
      .limit(1);

    const detectionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(haikuboxDetections)
      .where(eq(haikuboxDetections.userId, userId));

    const matchedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(haikuboxDetections)
      .where(and(
        eq(haikuboxDetections.userId, userId),
        sql`${haikuboxDetections.speciesId} IS NOT NULL`
      ));

    return NextResponse.json({
      lastSync: lastSync[0] || null,
      totalDetections: Number(detectionCount[0]?.count) || 0,
      matchedToGallery: Number(matchedCount[0]?.count) || 0,
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}

// Helper to log sync attempts
async function logSync(
  userId: string,
  syncType: string,
  status: string,
  recordsProcessed: number,
  errorMessage?: string
) {
  try {
    await db.insert(haikuboxSyncLog).values({
      userId,
      syncType,
      status,
      recordsProcessed,
      errorMessage: errorMessage || null,
    });
  } catch (err) {
    console.error("Failed to log sync:", err);
  }
}
