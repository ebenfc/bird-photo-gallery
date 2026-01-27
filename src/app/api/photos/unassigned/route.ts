import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { isNull, desc, sql, eq, and } from "drizzle-orm";
import { getThumbnailUrl, getOriginalUrl } from "@/lib/storage";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/photos/unassigned - Get count and list of unassigned photos
export async function GET(_request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    // Get count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(and(
        eq(photos.userId, userId),
        isNull(photos.speciesId)
      ));
    const count = Number(countResult[0]?.count ?? 0);

    // Get photos
    const result = await db
      .select()
      .from(photos)
      .where(and(
        eq(photos.userId, userId),
        isNull(photos.speciesId)
      ))
      .orderBy(desc(photos.uploadDate));

    const photosWithUrls = result.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      thumbnailFilename: photo.thumbnailFilename,
      thumbnailUrl: getThumbnailUrl(photo.thumbnailFilename),
      originalUrl: getOriginalUrl(photo.filename),
      uploadDate: photo.uploadDate,
      originalDateTaken: photo.originalDateTaken,
      dateTakenSource: photo.dateTakenSource,
      isFavorite: photo.isFavorite,
      notes: photo.notes,
      species: null,
    }));

    return NextResponse.json({
      count,
      photos: photosWithUrls,
    });
  } catch (error) {
    console.error("Error fetching unassigned photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch unassigned photos" },
      { status: 500 }
    );
  }
}
