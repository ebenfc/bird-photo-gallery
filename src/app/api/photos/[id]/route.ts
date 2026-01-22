import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getThumbnailUrl,
  getOriginalUrl,
} from "@/lib/storage";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { PhotoUpdateSchema, validateRequest } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/photos/[id] - Get a single photo
export async function GET(request: NextRequest, { params }: RouteParams) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId) || photoId <= 0) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

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
        speciesDescription: species.description,
        speciesRarity: species.rarity,
      })
      .from(photos)
      .leftJoin(species, eq(photos.speciesId, species.id))
      .where(eq(photos.id, photoId));

    const photo = result[0];
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({
      photo: {
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
              description: photo.speciesDescription,
              rarity: photo.speciesRarity,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

// PATCH /api/photos/[id] - Update photo metadata
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.write);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId) || photoId <= 0) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validate input using Zod schema
    const validation = validateRequest(PhotoUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { speciesId, isFavorite, notes, originalDateTaken } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (speciesId !== undefined) {
      updateData.speciesId = speciesId;
    }
    if (isFavorite !== undefined) {
      updateData.isFavorite = isFavorite;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }
    if (originalDateTaken !== undefined) {
      if (originalDateTaken === null) {
        updateData.originalDateTaken = null;
        updateData.dateTakenSource = "manual";
      } else {
        updateData.originalDateTaken = new Date(originalDateTaken);
        updateData.dateTakenSource = "manual";
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const result = await db
      .update(photos)
      .set(updateData)
      .where(eq(photos.id, photoId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const response = NextResponse.json({ photo: result[0] });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.write);
  } catch (error) {
    logError("Error updating photo", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/photos/[id]",
      method: "PATCH"
    });
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.write);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId) || photoId <= 0) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    // Delete the photo from database
    const result = await db
      .delete(photos)
      .where(eq(photos.id, photoId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, message: "Photo deleted" });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.write);
  } catch (error) {
    logError("Error deleting photo", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/photos/[id]",
      method: "DELETE"
    });
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
