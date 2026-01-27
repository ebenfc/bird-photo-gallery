import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { haikuboxDetections, species, photos } from "@/db/schema";
import { eq, sql, isNotNull, and } from "drizzle-orm";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/haikubox/stats - Get property bird statistics
export async function GET(_request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const currentYear = new Date().getFullYear();

    // Total unique species heard this year
    const heardCount = await db
      .select({
        count: sql<number>`count(distinct ${haikuboxDetections.speciesCommonName})`,
      })
      .from(haikuboxDetections)
      .where(and(
        eq(haikuboxDetections.userId, userId),
        eq(haikuboxDetections.dataYear, currentYear)
      ));

    // Total species photographed (with at least one photo)
    const photographedCount = await db
      .select({
        count: sql<number>`count(distinct ${photos.speciesId})`,
      })
      .from(photos)
      .where(and(
        eq(photos.userId, userId),
        isNotNull(photos.speciesId)
      ));

    // Species both heard AND photographed (matched and have photos)
    const heardAndPhotographed = await db
      .select({
        count: sql<number>`count(distinct ${haikuboxDetections.speciesId})`,
      })
      .from(haikuboxDetections)
      .innerJoin(species, and(
        eq(haikuboxDetections.speciesId, species.id),
        eq(species.userId, userId)
      ))
      .innerJoin(photos, and(
        eq(photos.speciesId, species.id),
        eq(photos.userId, userId)
      ))
      .where(and(
        eq(haikuboxDetections.userId, userId),
        eq(haikuboxDetections.dataYear, currentYear)
      ));

    // Species heard but NOT photographed (photo opportunities)
    // These are detections that either:
    // 1. Don't match any gallery species (speciesId is null), OR
    // 2. Match a species that has no photos
    const heardNotPhotographed = await db
      .select({
        commonName: haikuboxDetections.speciesCommonName,
        yearlyCount: haikuboxDetections.yearlyCount,
        lastHeardAt: haikuboxDetections.lastHeardAt,
      })
      .from(haikuboxDetections)
      .leftJoin(species, and(
        eq(haikuboxDetections.speciesId, species.id),
        eq(species.userId, userId)
      ))
      .leftJoin(photos, and(
        eq(photos.speciesId, species.id),
        eq(photos.userId, userId)
      ))
      .where(and(
        eq(haikuboxDetections.userId, userId),
        eq(haikuboxDetections.dataYear, currentYear)
      ))
      .groupBy(
        haikuboxDetections.id,
        haikuboxDetections.speciesCommonName,
        haikuboxDetections.yearlyCount,
        haikuboxDetections.lastHeardAt
      )
      .having(sql`count(${photos.id}) = 0`)
      .orderBy(sql`${haikuboxDetections.yearlyCount} DESC`);

    // All heard birds with photo status (for the captured tab)
    const recentlyHeard = await db
      .select({
        commonName: haikuboxDetections.speciesCommonName,
        lastHeardAt: haikuboxDetections.lastHeardAt,
        yearlyCount: haikuboxDetections.yearlyCount,
        hasPhoto: sql<boolean>`count(${photos.id}) > 0`,
        speciesId: haikuboxDetections.speciesId,
        rarity: species.rarity,
      })
      .from(haikuboxDetections)
      .leftJoin(species, and(
        eq(haikuboxDetections.speciesId, species.id),
        eq(species.userId, userId)
      ))
      .leftJoin(photos, and(
        eq(photos.speciesId, species.id),
        eq(photos.userId, userId)
      ))
      .where(and(
        eq(haikuboxDetections.userId, userId),
        eq(haikuboxDetections.dataYear, currentYear)
      ))
      .groupBy(
        haikuboxDetections.id,
        haikuboxDetections.speciesCommonName,
        haikuboxDetections.lastHeardAt,
        haikuboxDetections.yearlyCount,
        haikuboxDetections.speciesId,
        species.rarity
      )
      .orderBy(sql`${haikuboxDetections.yearlyCount} DESC`);

    return NextResponse.json({
      totalHeard: Number(heardCount[0]?.count) || 0,
      totalPhotographed: Number(photographedCount[0]?.count) || 0,
      heardAndPhotographed: Number(heardAndPhotographed[0]?.count) || 0,
      heardNotPhotographed,
      recentlyHeard,
      year: currentYear,
    });
  } catch (error) {
    console.error("Error fetching Haikubox stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
