import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, ebirdLifeList, haikuboxActivityLog } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import type { TimelineMonthSummary } from "@/types";

export const runtime = "nodejs";

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
    // Three parallel COUNT(*) GROUP BY month queries
    const [photoMonths, ebirdMonths, haikuboxMonths] = await Promise.all([
      // Photos: group by month of COALESCE(originalDateTaken, uploadDate)
      db
        .select({
          month: sql<string>`TO_CHAR(COALESCE(${photos.originalDateTaken}, ${photos.uploadDate}), 'YYYY-MM')`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(photos)
        .where(eq(photos.userId, userId))
        .groupBy(sql`TO_CHAR(COALESCE(${photos.originalDateTaken}, ${photos.uploadDate}), 'YYYY-MM')`),

      // eBird: group by month of firstObservedDate (date column, stored as YYYY-MM-DD string)
      db
        .select({
          month: sql<string>`SUBSTRING(${ebirdLifeList.firstObservedDate}, 1, 7)`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(ebirdLifeList)
        .where(
          eq(ebirdLifeList.userId, userId),
        )
        .groupBy(sql`SUBSTRING(${ebirdLifeList.firstObservedDate}, 1, 7)`),

      // Haikubox: group by month of detectedAt
      db
        .select({
          month: sql<string>`TO_CHAR(${haikuboxActivityLog.detectedAt}, 'YYYY-MM')`,
          count: sql<number>`COUNT(DISTINCT ${haikuboxActivityLog.speciesCommonName} || DATE(${haikuboxActivityLog.detectedAt}))::int`,
        })
        .from(haikuboxActivityLog)
        .where(eq(haikuboxActivityLog.userId, userId))
        .groupBy(sql`TO_CHAR(${haikuboxActivityLog.detectedAt}, 'YYYY-MM')`),
    ]);

    // Merge counts by month
    const monthMap = new Map<string, number>();

    for (const row of photoMonths) {
      if (row.month) {
        monthMap.set(row.month, (monthMap.get(row.month) ?? 0) + row.count);
      }
    }
    for (const row of ebirdMonths) {
      if (row.month) {
        monthMap.set(row.month, (monthMap.get(row.month) ?? 0) + row.count);
      }
    }
    for (const row of haikuboxMonths) {
      if (row.month) {
        monthMap.set(row.month, (monthMap.get(row.month) ?? 0) + row.count);
      }
    }

    // Sort descending by month string (lexicographic works for YYYY-MM)
    const months: TimelineMonthSummary[] = Array.from(monthMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, totalCount]) => ({ month, totalCount }));

    const response = NextResponse.json({ months });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError(
      "Error fetching timeline months",
      error instanceof Error ? error : new Error(String(error)),
      { route: "/api/timeline/months", method: "GET" }
    );
    return NextResponse.json(
      { error: "Failed to fetch timeline months" },
      { status: 500 }
    );
  }
}
