import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings, haikuboxDetections, haikuboxSyncLog, species } from "@/db/schema";
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

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * Check if the request is from a Vercel Cron job using CRON_SECRET.
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically.
 */
function isCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Core sync logic for a single user.
 * Extracted so both manual (Clerk auth) and cron (CRON_SECRET) paths can use it.
 */
async function syncUserHaikubox(userId: string): Promise<{
  success: boolean;
  processed: number;
  year: number;
  matched: number;
  error?: string;
}> {
  const currentYear = new Date().getFullYear();

  // 1. Fetch yearly data from Haikubox
  const yearlyData = await fetchYearlyDetections(userId, currentYear);

  if (!yearlyData || yearlyData.length === 0) {
    await logSync(userId, "yearly", "error", 0, "No data returned from Haikubox API");
    return { success: false, processed: 0, year: currentYear, matched: 0, error: "No data returned from Haikubox API" };
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
  console.log(`[${userId}] Stored ${activityLogsStored} activity log entries`);

  // 5a. Cleanup old activity logs (90-day retention)
  const cleaned = await cleanupOldActivityLogs(userId, 90);
  if (cleaned > 0) {
    console.log(`[${userId}] Cleaned up ${cleaned} old activity log entries`);
  }

  // 6. Upsert detection records
  let processed = 0;
  for (const detection of yearlyData) {
    const birdName = detection.bird;
    const normalized = normalizeCommonName(birdName);
    const matchedSpeciesId = speciesMap.get(normalized) || null;
    const lastHeard = recentMap.get(normalized) || null;

    await db
      .insert(haikuboxDetections)
      .values({
        userId,
        speciesCommonName: birdName,
        speciesId: matchedSpeciesId,
        yearlyCount: detection.count,
        lastHeardAt: lastHeard,
        dataYear: currentYear,
      })
      .onConflictDoUpdate({
        target: [haikuboxDetections.userId, haikuboxDetections.speciesCommonName, haikuboxDetections.dataYear],
        set: {
          yearlyCount: detection.count,
          speciesId: matchedSpeciesId,
          lastHeardAt: lastHeard,
          syncedAt: new Date(),
        },
      });
    processed++;
  }

  // 7. Log successful sync
  await logSync(userId, "yearly", "success", processed);

  return { success: true, processed, year: currentYear, matched: gallerySpecies.length };
}

// POST /api/haikubox/sync - Sync Haikubox data to database
// Can be triggered by Vercel Cron (CRON_SECRET auth) or manually (Clerk auth)
export async function POST(request: NextRequest) {
  // Rate limiting - sync operations are expensive
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.sync);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  // --- Cron path: sync ALL users with Haikubox serials ---
  if (isCronRequest(request)) {
    try {
      // Find all users who have configured a Haikubox serial
      const usersWithSerial = await db
        .select({ userId: appSettings.userId })
        .from(appSettings)
        .where(eq(appSettings.key, "haikubox_serial"));

      if (usersWithSerial.length === 0) {
        logInfo("Haikubox cron: no users with configured serials");
        return NextResponse.json({ success: true, message: "No users with Haikubox serials", synced: 0 });
      }

      const results: Array<{ userId: string; success: boolean; processed: number; error?: string }> = [];

      for (const { userId } of usersWithSerial) {
        if (!userId) continue;
        try {
          const result = await syncUserHaikubox(userId);
          results.push({ userId, success: result.success, processed: result.processed, error: result.error });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          logError("Haikubox cron sync error for user", error instanceof Error ? error : new Error(errorMsg), {
            route: "/api/haikubox/sync",
            method: "POST (cron)",
            userId,
          });
          await logSync(userId, "yearly", "error", 0, errorMsg);
          results.push({ userId, success: false, processed: 0, error: errorMsg });
        }
      }

      // Invalidate cache after all syncs
      invalidateHaikuboxCache();

      const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
      const totalSuccess = results.filter(r => r.success).length;

      logInfo("Haikubox cron completed", {
        totalUsers: results.length,
        successCount: totalSuccess,
        totalProcessed,
      });

      return NextResponse.json({
        success: true,
        synced: results.length,
        successCount: totalSuccess,
        totalProcessed,
        results,
      });
    } catch (error) {
      logError("Haikubox cron fatal error", error instanceof Error ? error : new Error(String(error)), {
        route: "/api/haikubox/sync",
        method: "POST (cron)",
      });
      return NextResponse.json({ error: "Cron sync failed" }, { status: 500 });
    }
  }

  // --- Manual path: sync current authenticated user ---
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const result = await syncUserHaikubox(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Sync failed" },
        { status: 502 }
      );
    }

    // Invalidate cache
    invalidateHaikuboxCache();

    logInfo("Haikubox sync completed", { processed: result.processed, year: result.year });

    const response = NextResponse.json({
      success: true,
      processed: result.processed,
      year: result.year,
      matched: result.matched,
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.sync);
  } catch (error) {
    logError("Haikubox sync error", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/haikubox/sync",
      method: "POST"
    });

    await logSync(userId, "yearly", "error", 0, error instanceof Error ? error.message : "Unknown error");

    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}

// GET /api/haikubox/sync - Get sync status
export async function GET(_request: NextRequest) {
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
