import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species, ebirdLifeList, haikuboxActivityLog } from "@/db/schema";
import { eq, and, gte, lt, isNotNull, desc, sql } from "drizzle-orm";
import { getThumbnailUrl } from "@/lib/storage";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import type {
  PhotoTimelineEvent,
  EbirdTimelineEvent,
  HaikuboxTimelineEvent,
  TimelineEvent,
} from "@/types";

export const runtime = "nodejs";

// --- Query helpers (private to this route) ---

async function fetchPhotoEvents(
  userId: string,
  windowStart: Date,
  before: Date
): Promise<PhotoTimelineEvent[]> {
  const rows = await db
    .select({
      id: photos.id,
      originalDateTaken: photos.originalDateTaken,
      uploadDate: photos.uploadDate,
      thumbnailFilename: photos.thumbnailFilename,
      speciesId: photos.speciesId,
      speciesName: species.commonName,
      isFavorite: photos.isFavorite,
    })
    .from(photos)
    .leftJoin(species, eq(photos.speciesId, species.id))
    .where(
      and(
        eq(photos.userId, userId),
        sql`COALESCE(${photos.originalDateTaken}, ${photos.uploadDate}) >= ${windowStart}`,
        sql`COALESCE(${photos.originalDateTaken}, ${photos.uploadDate}) < ${before}`
      )
    )
    .orderBy(desc(sql`COALESCE(${photos.originalDateTaken}, ${photos.uploadDate})`));

  return rows.map((row) => {
    const usedUploadDate = row.originalDateTaken === null;
    const eventDate = (row.originalDateTaken ?? row.uploadDate).toISOString();
    return {
      type: "photo" as const,
      id: row.id,
      eventDate,
      thumbnailUrl: getThumbnailUrl(row.thumbnailFilename),
      speciesId: row.speciesId,
      speciesName: row.speciesName,
      isFavorite: row.isFavorite,
      usedUploadDate,
    };
  });
}

async function fetchEbirdEvents(
  userId: string,
  windowStart: Date,
  before: Date
): Promise<EbirdTimelineEvent[]> {
  // Convert Date bounds to YYYY-MM-DD strings for date column comparison
  const windowStartDate = windowStart.toISOString().slice(0, 10);
  const beforeDate = before.toISOString().slice(0, 10);

  const rows = await db
    .select({
      id: ebirdLifeList.id,
      speciesCode: ebirdLifeList.speciesCode,
      commonName: ebirdLifeList.commonName,
      scientificName: ebirdLifeList.scientificName,
      firstObservedDate: ebirdLifeList.firstObservedDate,
    })
    .from(ebirdLifeList)
    .where(
      and(
        eq(ebirdLifeList.userId, userId),
        isNotNull(ebirdLifeList.firstObservedDate),
        sql`${ebirdLifeList.firstObservedDate} >= ${windowStartDate}`,
        sql`${ebirdLifeList.firstObservedDate} < ${beforeDate}`
      )
    )
    .orderBy(desc(ebirdLifeList.firstObservedDate));

  return rows.map((row) => ({
    type: "ebird_lifer" as const,
    id: row.id,
    // Convert date string "YYYY-MM-DD" to midnight UTC ISO string for consistent sorting
    eventDate: new Date(row.firstObservedDate + "T00:00:00Z").toISOString(),
    speciesCode: row.speciesCode,
    commonName: row.commonName,
    scientificName: row.scientificName ?? null,
  }));
}

async function fetchHaikuboxEvents(
  userId: string,
  windowStart: Date,
  before: Date
): Promise<HaikuboxTimelineEvent[]> {
  // Aggregate: first detection per species per calendar day, with count
  const rows = await db
    .select({
      speciesCommonName: haikuboxActivityLog.speciesCommonName,
      speciesId: haikuboxActivityLog.speciesId,
      firstDetectionAt: sql<Date>`MIN(${haikuboxActivityLog.detectedAt})`,
      detectionCount: sql<number>`COUNT(*)::int`,
    })
    .from(haikuboxActivityLog)
    .where(
      and(
        eq(haikuboxActivityLog.userId, userId),
        gte(haikuboxActivityLog.detectedAt, windowStart),
        lt(haikuboxActivityLog.detectedAt, before)
      )
    )
    .groupBy(
      haikuboxActivityLog.speciesCommonName,
      haikuboxActivityLog.speciesId,
      sql`DATE(${haikuboxActivityLog.detectedAt})`
    )
    .orderBy(desc(sql`MIN(${haikuboxActivityLog.detectedAt})`));

  return rows.map((row) => ({
    type: "haikubox" as const,
    speciesCommonName: row.speciesCommonName,
    speciesId: row.speciesId,
    eventDate: new Date(row.firstDetectionAt).toISOString(),
    detectionCount: row.detectionCount,
  }));
}

// --- Route handler ---

export async function GET(request: NextRequest) {
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const beforeParam = searchParams.get("before");
    const daysParam = searchParams.get("days");

    const before = beforeParam ? new Date(beforeParam) : new Date();
    if (isNaN(before.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'before' parameter" },
        { status: 400 }
      );
    }

    const days = Math.min(90, Math.max(1, parseInt(daysParam || "30") || 30));
    const windowStart = new Date(before.getTime() - days * 24 * 60 * 60 * 1000);

    // Run all three queries in parallel
    const [photoEvents, ebirdEvents, haikuboxEvents] = await Promise.all([
      fetchPhotoEvents(userId, windowStart, before),
      fetchEbirdEvents(userId, windowStart, before),
      fetchHaikuboxEvents(userId, windowStart, before),
    ]);

    // Merge and sort by eventDate descending
    const events: TimelineEvent[] = [
      ...photoEvents,
      ...ebirdEvents,
      ...haikuboxEvents,
    ].sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );

    // nextCursor = oldest event's eventDate, or null if no events
    const lastEvent = events[events.length - 1];
    const nextCursor = lastEvent ? lastEvent.eventDate : null;

    const response = NextResponse.json({
      events,
      nextCursor,
      counts: {
        photos: photoEvents.length,
        ebird: ebirdEvents.length,
        haikubox: haikuboxEvents.length,
      },
    });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError(
      "Error fetching timeline",
      error instanceof Error ? error : new Error(String(error)),
      { route: "/api/timeline", method: "GET" }
    );
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
