import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ebirdLifeList, species } from "@/db/schema";
import { eq, and, sql, asc, desc } from "drizzle-orm";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

type WishlistSort = "alpha" | "recent_observed";

// GET /api/ebird/wishlist — Get eBird species not yet photographed in BirdFeed
export async function GET(request: NextRequest) {
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) return rateCheck.response;

  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;
  const { userId } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const sort = (searchParams.get("sort") || "alpha") as WishlistSort;

    // Get all eBird life list entries that DON'T match any BirdFeed species
    // Match by: ebirdSpeciesCode (reliable) OR commonName case-insensitive (fallback)
    const orderBy = sort === "recent_observed"
      ? [desc(ebirdLifeList.firstObservedDate), asc(ebirdLifeList.commonName)]
      : [asc(ebirdLifeList.commonName)];

    const result = await db
      .select({
        id: ebirdLifeList.id,
        speciesCode: ebirdLifeList.speciesCode,
        commonName: ebirdLifeList.commonName,
        scientificName: ebirdLifeList.scientificName,
        firstObservedDate: ebirdLifeList.firstObservedDate,
        importedAt: ebirdLifeList.importedAt,
      })
      .from(ebirdLifeList)
      .leftJoin(
        species,
        and(
          eq(species.userId, ebirdLifeList.userId),
          sql`(
            ${species.ebirdSpeciesCode} = ${ebirdLifeList.speciesCode}
            OR LOWER(${species.commonName}) = LOWER(${ebirdLifeList.commonName})
          )`
        )
      )
      .where(
        and(
          eq(ebirdLifeList.userId, userId),
          sql`${species.id} IS NULL` // No matching BirdFeed species
        )
      )
      .orderBy(...orderBy);

    const response = NextResponse.json({
      wishlist: result,
      total: result.length,
    });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching eBird wishlist", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/ebird/wishlist",
      method: "GET",
    });
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}
