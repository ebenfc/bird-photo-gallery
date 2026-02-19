import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ebirdLifeList } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

// GET /api/ebird/status — Get eBird import status for the current user
export async function GET(request: NextRequest) {
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) return rateCheck.response;

  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;
  const { userId } = authResult;

  try {
    const result = await db
      .select({
        totalSpecies: sql<number>`count(*)`,
        lastImportedAt: sql<string | null>`max(${ebirdLifeList.importedAt})`,
      })
      .from(ebirdLifeList)
      .where(eq(ebirdLifeList.userId, userId));

    const row = result[0];
    const totalSpecies = Number(row?.totalSpecies ?? 0);

    const response = NextResponse.json({
      hasImport: totalSpecies > 0,
      totalSpecies,
      lastImportedAt: row?.lastImportedAt ?? null,
    });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching eBird status", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/ebird/status",
      method: "GET",
    });
    return NextResponse.json({ error: "Failed to fetch eBird status" }, { status: 500 });
  }
}
