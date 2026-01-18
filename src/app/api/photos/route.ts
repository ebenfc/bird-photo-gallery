import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getThumbnailUrl, getOriginalUrl } from "@/lib/storage";

// GET /api/photos - List photos with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const speciesId = searchParams.get("speciesId");
    const favorites = searchParams.get("favorites");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (speciesId) {
      conditions.push(eq(photos.speciesId, parseInt(speciesId)));
    }
    if (favorites === "true") {
      conditions.push(eq(photos.isFavorite, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(whereClause);
    const total = countResult[0].count;

    // Get photos with species info
    const result = await db
      .select({
        id: photos.id,
        filename: photos.filename,
        thumbnailFilename: photos.thumbnailFilename,
        uploadDate: photos.uploadDate,
        originalDateTaken: photos.originalDateTaken,
        dateTakenSource: photos.dateTakenSource,
        isFavorite: photos.isFavorite,
        notes: photos.notes,
        speciesId: photos.speciesId,
        speciesCommonName: species.commonName,
        speciesScientificName: species.scientificName,
      })
      .from(photos)
      .leftJoin(species, eq(photos.speciesId, species.id))
      .where(whereClause)
      .orderBy(desc(photos.uploadDate))
      .limit(limit)
      .offset(offset);

    // Add URLs to each photo
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
      species: photo.speciesId
        ? {
            id: photo.speciesId,
            commonName: photo.speciesCommonName,
            scientificName: photo.speciesScientificName,
          }
        : null,
    }));

    return NextResponse.json({
      photos: photosWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
