// Activity Service
// Handles storage and retrieval of bird activity patterns for the timeline feature

import { db } from "@/db";
import { haikuboxActivityLog } from "@/db/schema";
import { and, sql, gte, desc, inArray, eq } from "drizzle-orm";
import { normalizeCommonName, HaikuboxRecentDetection } from "./haikubox";

// Types
export interface HourlyActivity {
  hour: number;
  count: number;
  percentage: number;
}

export interface ActivityPattern {
  speciesName: string;
  totalDetections: number;
  hourlyBreakdown: HourlyActivity[];
  peakHours: number[];
  dataDateRange: { start: string; end: string } | null;
}

export interface ActiveSpecies {
  speciesName: string;
  activityScore: number;
  recentCount: number;
}

/**
 * Store activity logs from recent detections (with deduplication)
 * Uses ON CONFLICT DO NOTHING to skip duplicates
 */
export async function storeActivityLogs(
  userId: string,
  detections: HaikuboxRecentDetection[],
  speciesMap: Map<string, number>
): Promise<number> {
  let stored = 0;

  for (const detection of detections) {
    const normalized = normalizeCommonName(detection.species);
    const matchedSpeciesId = speciesMap.get(normalized) || null;
    const detectedAt = new Date(detection.timestamp);

    try {
      await db
        .insert(haikuboxActivityLog)
        .values({
          userId,
          speciesCommonName: detection.species,
          speciesId: matchedSpeciesId,
          detectedAt,
          hourOfDay: detectedAt.getHours(),
          dayOfWeek: detectedAt.getDay(),
        })
        .onConflictDoNothing();
      stored++;
    } catch (error) {
      // Skip any insert errors silently (likely constraint violations)
      console.debug("Skipped activity log:", detection.species, detection.timestamp);
    }
  }

  return stored;
}

/**
 * Get activity pattern for a specific species
 * Returns hourly breakdown and peak hours
 */
export async function getSpeciesActivityPattern(
  userId: string,
  speciesName: string,
  daysBack: number = 90
): Promise<ActivityPattern | null> {
  const normalized = normalizeCommonName(speciesName);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Query activity logs for this species
  const logs = await db
    .select({
      hourOfDay: haikuboxActivityLog.hourOfDay,
      detectedAt: haikuboxActivityLog.detectedAt,
      speciesCommonName: haikuboxActivityLog.speciesCommonName,
    })
    .from(haikuboxActivityLog)
    .where(
      and(
        eq(haikuboxActivityLog.userId, userId),
        sql`LOWER(${haikuboxActivityLog.speciesCommonName}) = ${normalized}`,
        gte(haikuboxActivityLog.detectedAt, startDate)
      )
    );

  if (logs.length === 0) {
    return null;
  }

  // Build hourly breakdown
  const hourlyCounts = new Array(24).fill(0);
  for (const log of logs) {
    hourlyCounts[log.hourOfDay]++;
  }

  const totalDetections = logs.length;
  const hourlyBreakdown: HourlyActivity[] = hourlyCounts.map((count, hour) => ({
    hour,
    count,
    percentage: totalDetections > 0 ? (count / totalDetections) * 100 : 0,
  }));

  // Find peak hours (hours with activity >= 80% of max)
  const maxCount = Math.max(...hourlyCounts);
  const threshold = maxCount * 0.6; // 60% of max to catch more peak hours
  const peakHours = hourlyCounts
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count >= threshold && h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4) // Top 4 peak hours
    .map((h) => h.hour)
    .sort((a, b) => a - b);

  // Get date range
  const dates = logs.map((l) => new Date(l.detectedAt!).getTime());
  const dataDateRange = dates.length > 0
    ? {
        start: new Date(Math.min(...dates)).toISOString(),
        end: new Date(Math.max(...dates)).toISOString(),
      }
    : null;

  return {
    speciesName: logs[0]!.speciesCommonName,
    totalDetections,
    hourlyBreakdown,
    peakHours,
    dataDateRange,
  };
}

/**
 * Get species that are typically active at the current hour
 * Uses historical data to predict what's likely active now
 */
export async function getActiveNowSpecies(
  userId: string,
  hourWindow: number = 1
): Promise<ActiveSpecies[]> {
  const currentHour = new Date().getHours();

  // Build list of hours to check (current hour +/- window)
  const hoursToCheck: number[] = [];
  for (let i = -hourWindow; i <= hourWindow; i++) {
    hoursToCheck.push((currentHour + i + 24) % 24);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get activity counts for current hour range
  const results = await db
    .select({
      speciesName: haikuboxActivityLog.speciesCommonName,
      count: sql<number>`count(*)::int`,
    })
    .from(haikuboxActivityLog)
    .where(
      and(
        eq(haikuboxActivityLog.userId, userId),
        inArray(haikuboxActivityLog.hourOfDay, hoursToCheck),
        gte(haikuboxActivityLog.detectedAt, thirtyDaysAgo)
      )
    )
    .groupBy(haikuboxActivityLog.speciesCommonName)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return results.map((r) => ({
    speciesName: r.speciesName,
    activityScore: r.count,
    recentCount: r.count,
  }));
}

/**
 * Get heatmap data for all species activity
 * Returns hourly breakdown for each species
 */
export async function getAllSpeciesHeatmap(
  userId: string,
  daysBack: number = 30
): Promise<Array<{ speciesName: string; hourlyData: number[] }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const results = await db
    .select({
      speciesName: haikuboxActivityLog.speciesCommonName,
      hourOfDay: haikuboxActivityLog.hourOfDay,
      count: sql<number>`count(*)::int`,
    })
    .from(haikuboxActivityLog)
    .where(and(
      eq(haikuboxActivityLog.userId, userId),
      gte(haikuboxActivityLog.detectedAt, startDate)
    ))
    .groupBy(haikuboxActivityLog.speciesCommonName, haikuboxActivityLog.hourOfDay)
    .orderBy(haikuboxActivityLog.speciesCommonName);

  // Transform into species -> hourly array format
  const speciesMap = new Map<string, number[]>();

  for (const row of results) {
    if (!speciesMap.has(row.speciesName)) {
      speciesMap.set(row.speciesName, new Array(24).fill(0));
    }
    speciesMap.get(row.speciesName)![row.hourOfDay] = row.count;
  }

  return Array.from(speciesMap.entries()).map(([speciesName, hourlyData]) => ({
    speciesName,
    hourlyData,
  }));
}

/**
 * Cleanup old activity logs (retention policy)
 * Deletes records older than the specified number of days
 */
export async function cleanupOldActivityLogs(
  userId: string,
  retentionDays: number = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const result = await db
    .delete(haikuboxActivityLog)
    .where(and(
      eq(haikuboxActivityLog.userId, userId),
      sql`${haikuboxActivityLog.detectedAt} < ${cutoffDate}`
    ));

  return result.rowCount || 0;
}
