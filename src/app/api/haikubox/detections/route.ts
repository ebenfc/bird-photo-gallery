import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { haikuboxDetections, species } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { normalizeCommonName } from "@/lib/haikubox";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/haikubox/detections - Query cached detection data
export async function GET(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const recentOnly = searchParams.get("recent") === "true";
    const unmatchedOnly = searchParams.get("unmatched") === "true";
    const speciesName = searchParams.get("species");

    // If looking up by species name, do a more targeted query
    if (speciesName) {
      const normalizedSearch = normalizeCommonName(speciesName);

      // Find detection matching the species name (case-insensitive, apostrophe-normalized)
      const allDetections = await db
        .select({
          id: haikuboxDetections.id,
          speciesCommonName: haikuboxDetections.speciesCommonName,
          yearlyCount: haikuboxDetections.yearlyCount,
          lastHeardAt: haikuboxDetections.lastHeardAt,
          dataYear: haikuboxDetections.dataYear,
          matchedSpeciesId: haikuboxDetections.speciesId,
          matchedSpeciesName: species.commonName,
        })
        .from(haikuboxDetections)
        .leftJoin(species, and(
          eq(haikuboxDetections.speciesId, species.id),
          eq(species.userId, userId)
        ))
        .where(eq(haikuboxDetections.userId, userId));

      // Filter with normalized comparison
      const matchedDetections = allDetections.filter((d) => {
        const normalizedDetection = normalizeCommonName(d.speciesCommonName);
        const normalizedMatched = d.matchedSpeciesName ? normalizeCommonName(d.matchedSpeciesName) : null;
        return normalizedDetection === normalizedSearch || normalizedMatched === normalizedSearch;
      });

      return NextResponse.json({ detections: matchedDetections });
    }

    // Base query with species join
    let detections = await db
      .select({
        id: haikuboxDetections.id,
        speciesCommonName: haikuboxDetections.speciesCommonName,
        yearlyCount: haikuboxDetections.yearlyCount,
        lastHeardAt: haikuboxDetections.lastHeardAt,
        dataYear: haikuboxDetections.dataYear,
        matchedSpeciesId: haikuboxDetections.speciesId,
        matchedSpeciesName: species.commonName,
      })
      .from(haikuboxDetections)
      .leftJoin(species, and(
        eq(haikuboxDetections.speciesId, species.id),
        eq(species.userId, userId)
      ))
      .where(eq(haikuboxDetections.userId, userId))
      .orderBy(desc(haikuboxDetections.yearlyCount))
      .limit(limit);

    // Filter to recent (last 7 days) if requested
    if (recentOnly) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      detections = detections.filter((d) => {
        if (!d.lastHeardAt) return false;
        return new Date(d.lastHeardAt) > weekAgo;
      });
    }

    // Filter to unmatched only if requested
    if (unmatchedOnly) {
      detections = detections.filter((d) => !d.matchedSpeciesId);
    }

    return NextResponse.json({ detections });
  } catch (error) {
    console.error("Error fetching detections:", error);
    return NextResponse.json(
      { error: "Failed to fetch detections" },
      { status: 500 }
    );
  }
}
