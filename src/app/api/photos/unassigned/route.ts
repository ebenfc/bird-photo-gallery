import { NextResponse } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { isNull, desc, sql } from "drizzle-orm";
import { getThumbnailUrl, getOriginalUrl } from "@/lib/storage";

// GET /api/photos/unassigned - Get count and list of unassigned photos
export async function GET() {
  try {
    // Get count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(isNull(photos.speciesId));
    const count = countResult[0]?.count ?? 0;

    // Get photos
    const result = await db
      .select()
      .from(photos)
      .where(isNull(photos.speciesId))
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
