import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { haikuboxDetections, species } from "@/db/schema";
import { eq, desc, sql, isNull } from "drizzle-orm";

// GET /api/haikubox/detections - Query cached detection data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const recentOnly = searchParams.get("recent") === "true";
    const unmatchedOnly = searchParams.get("unmatched") === "true";

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
      .leftJoin(species, eq(haikuboxDetections.speciesId, species.id))
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
