import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { haikuboxDetections, haikuboxSyncLog, species } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  fetchYearlyDetections,
  fetchRecentDetections,
  normalizeCommonName,
} from "@/lib/haikubox";

// POST /api/haikubox/sync - Sync Haikubox data to database
// Can be triggered by Vercel Cron or manually
export async function POST(request: NextRequest) {
  // Optional: Verify authorization for cron requests
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.HAIKUBOX_SYNC_KEY;

  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const currentYear = new Date().getFullYear();

    // 1. Fetch yearly data from Haikubox
    const yearlyData = await fetchYearlyDetections(currentYear);

    if (!yearlyData || yearlyData.length === 0) {
      await logSync("yearly", "error", 0, "No data returned from Haikubox API");
      return NextResponse.json(
        { error: "No data returned from Haikubox API" },
        { status: 502 }
      );
    }

    // 2. Fetch recent detections for "last heard" timestamps
    const recentData = await fetchRecentDetections(72); // Last 3 days

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
    const gallerySpecies = await db.select().from(species);
    const speciesMap = new Map(
      gallerySpecies.map((s) => [normalizeCommonName(s.commonName), s.id])
    );

    // 5. Upsert detection records
    let processed = 0;
    for (const detection of yearlyData) {
      const birdName = detection.bird;
      const normalized = normalizeCommonName(birdName);
      const matchedSpeciesId = speciesMap.get(normalized) || null;
      const lastHeard = recentMap.get(normalized) || null;

      // Check if record exists for this species/year
      const existing = await db
        .select()
        .from(haikuboxDetections)
        .where(
          and(
            eq(haikuboxDetections.speciesCommonName, birdName),
            eq(haikuboxDetections.dataYear, currentYear)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(haikuboxDetections)
          .set({
            yearlyCount: detection.count,
            speciesId: matchedSpeciesId,
            lastHeardAt: lastHeard,
            syncedAt: new Date(),
          })
          .where(eq(haikuboxDetections.id, existing[0].id));
      } else {
        // Insert new record
        await db.insert(haikuboxDetections).values({
          speciesCommonName: birdName,
          speciesId: matchedSpeciesId,
          yearlyCount: detection.count,
          lastHeardAt: lastHeard,
          dataYear: currentYear,
        });
      }
      processed++;
    }

    // 6. Log successful sync
    await logSync("yearly", "success", processed);

    return NextResponse.json({
      success: true,
      processed,
      year: currentYear,
      matched: gallerySpecies.length,
    });
  } catch (error) {
    console.error("Haikubox sync error:", error);

    // Log failed sync
    await logSync(
      "yearly",
      "error",
      0,
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

// GET /api/haikubox/sync - Get sync status
export async function GET() {
  try {
    const lastSync = await db
      .select()
      .from(haikuboxSyncLog)
      .orderBy(desc(haikuboxSyncLog.syncedAt))
      .limit(1);

    const detectionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(haikuboxDetections);

    const matchedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(haikuboxDetections)
      .where(sql`${haikuboxDetections.speciesId} IS NOT NULL`);

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
  syncType: string,
  status: string,
  recordsProcessed: number,
  errorMessage?: string
) {
  try {
    await db.insert(haikuboxSyncLog).values({
      syncType,
      status,
      recordsProcessed,
      errorMessage: errorMessage || null,
    });
  } catch (err) {
    console.error("Failed to log sync:", err);
  }
}
