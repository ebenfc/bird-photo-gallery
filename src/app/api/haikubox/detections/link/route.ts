import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { haikuboxDetections, haikuboxActivityLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizeCommonName } from "@/lib/haikubox";

// POST /api/haikubox/detections/link
// Links detections to a newly created species
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { speciesId, detectionCommonName } = body;

    if (!speciesId || !detectionCommonName) {
      return NextResponse.json(
        { error: "speciesId and detectionCommonName are required" },
        { status: 400 }
      );
    }

    const normalizedName = normalizeCommonName(detectionCommonName);

    // Get all detections to find matching ones (case-insensitive, apostrophe-normalized)
    const allDetections = await db.select().from(haikuboxDetections);
    const matchingDetections = allDetections.filter(
      (d) => normalizeCommonName(d.speciesCommonName) === normalizedName
    );

    // Update haikuboxDetections table
    let updatedDetections = 0;
    for (const detection of matchingDetections) {
      await db
        .update(haikuboxDetections)
        .set({ speciesId })
        .where(eq(haikuboxDetections.id, detection.id));
      updatedDetections++;
    }

    // Also update haikuboxActivityLog table for timeline consistency
    const allActivityLogs = await db.select().from(haikuboxActivityLog);
    const matchingActivityLogs = allActivityLogs.filter(
      (a) => normalizeCommonName(a.speciesCommonName) === normalizedName
    );

    let updatedActivityLogs = 0;
    for (const log of matchingActivityLogs) {
      await db
        .update(haikuboxActivityLog)
        .set({ speciesId })
        .where(eq(haikuboxActivityLog.id, log.id));
      updatedActivityLogs++;
    }

    return NextResponse.json({
      success: true,
      updatedDetections,
      updatedActivityLogs,
    });
  } catch (error) {
    console.error("Error linking detections:", error);
    return NextResponse.json(
      { error: "Failed to link detections" },
      { status: 500 }
    );
  }
}
