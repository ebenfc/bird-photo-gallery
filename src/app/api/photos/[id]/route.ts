import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getThumbnailUrl,
  getOriginalUrl,
  deletePhotoFiles,
} from "@/lib/storage";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { PhotoUpdateSchema, validateRequest } from "@/lib/validation";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { checkSpeciesLimit, checkUnassignedLimit } from "@/lib/photoLimits";
import { SPECIES_PHOTO_LIMIT, UNASSIGNED_PHOTO_LIMIT } from "@/config/limits";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

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

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

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
      .where(and(
        eq(photos.id, photoId),
        eq(photos.userId, userId)
      ));

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

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

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

    const { speciesId, replacePhotoId, isFavorite, notes, originalDateTaken } = validation.data;

    // --- Species limit checks when speciesId is changing ---
    if (speciesId !== undefined) {
      // Fetch current photo to see if species is actually changing
      const [currentPhoto] = await db
        .select({ speciesId: photos.speciesId })
        .from(photos)
        .where(and(eq(photos.id, photoId), eq(photos.userId, userId)));

      if (!currentPhoto) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }

      const isSpeciesChanging = currentPhoto.speciesId !== speciesId;

      if (isSpeciesChanging) {
        if (speciesId === null) {
          // Moving to unassigned — check unassigned inbox limit
          const unassignedCheck = await checkUnassignedLimit(userId);
          if (!unassignedCheck.allowed) {
            return NextResponse.json(
              {
                error: unassignedCheck.error,
                code: "UNASSIGNED_AT_LIMIT",
                currentCount: unassignedCheck.currentCount,
                limit: UNASSIGNED_PHOTO_LIMIT,
              },
              { status: 409 }
            );
          }
        } else {
          // Moving to a new species — check that species' limit
          const limitCheck = await checkSpeciesLimit(speciesId, userId, replacePhotoId);
          if (!limitCheck.allowed) {
            return NextResponse.json(
              {
                error: limitCheck.error,
                code: "SPECIES_AT_LIMIT",
                currentCount: limitCheck.currentCount,
                limit: SPECIES_PHOTO_LIMIT,
              },
              { status: 409 }
            );
          }
        }
      }
    }

    // Build the update data (excluding replacePhotoId which is handled separately)
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

    let result;
    let oldPhotoFiles: { filename: string; thumbnailFilename: string } | null = null;

    if (replacePhotoId && speciesId) {
      // Atomic swap: delete the replacement photo + update this photo's species in a transaction
      const txResult = await db.transaction(async (tx) => {
        // Verify the replacement photo belongs to this user and target species
        const [oldPhoto] = await tx
          .select({
            id: photos.id,
            filename: photos.filename,
            thumbnailFilename: photos.thumbnailFilename,
            speciesId: photos.speciesId,
          })
          .from(photos)
          .where(and(eq(photos.id, replacePhotoId), eq(photos.userId, userId)));

        if (!oldPhoto) {
          throw new Error("REPLACE_PHOTO_NOT_FOUND");
        }
        if (oldPhoto.speciesId !== speciesId) {
          throw new Error("REPLACE_PHOTO_WRONG_SPECIES");
        }

        // Clear coverPhotoId if the replaced photo was the cover
        const [speciesRecord] = await tx
          .select({ coverPhotoId: species.coverPhotoId })
          .from(species)
          .where(eq(species.id, speciesId));

        if (speciesRecord?.coverPhotoId === replacePhotoId) {
          await tx
            .update(species)
            .set({ coverPhotoId: null })
            .where(eq(species.id, speciesId));
        }

        // Delete the replacement photo
        await tx.delete(photos).where(eq(photos.id, replacePhotoId));

        // Update the current photo
        const [updated] = await tx
          .update(photos)
          .set(updateData)
          .where(and(eq(photos.id, photoId), eq(photos.userId, userId)))
          .returning();

        return {
          updated,
          oldFilename: oldPhoto.filename,
          oldThumbFilename: oldPhoto.thumbnailFilename,
        };
      });

      result = txResult.updated ? [txResult.updated] : [];
      oldPhotoFiles = {
        filename: txResult.oldFilename,
        thumbnailFilename: txResult.oldThumbFilename,
      };
    } else {
      // Normal update (no swap)
      result = await db
        .update(photos)
        .set(updateData)
        .where(and(
          eq(photos.id, photoId),
          eq(photos.userId, userId)
        ))
        .returning();
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Clean up swapped photo files from storage (fire-and-forget)
    if (oldPhotoFiles) {
      deletePhotoFiles(oldPhotoFiles.filename, oldPhotoFiles.thumbnailFilename).catch((err) =>
        logError("Failed to clean up swapped photo files", err instanceof Error ? err : new Error(String(err)), {
          route: "/api/photos/[id]",
          method: "PATCH",
          step: "storage_cleanup",
        })
      );
    }

    const response = NextResponse.json({ photo: result[0] });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.write);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg === "REPLACE_PHOTO_NOT_FOUND") {
      return NextResponse.json(
        { error: "The photo you selected to swap out was not found" },
        { status: 400 }
      );
    }
    if (errorMsg === "REPLACE_PHOTO_WRONG_SPECIES") {
      return NextResponse.json(
        { error: "The photo you selected to swap out belongs to a different species" },
        { status: 400 }
      );
    }

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

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId) || photoId <= 0) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    // Delete the photo from database
    const result = await db
      .delete(photos)
      .where(and(
        eq(photos.id, photoId),
        eq(photos.userId, userId)
      ))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Clean up storage files (best-effort — don't fail the request if this errors)
    const deleted = result[0];
    if (deleted) {
      deletePhotoFiles(deleted.filename, deleted.thumbnailFilename).catch((err) =>
        logError("Failed to clean up storage files", err instanceof Error ? err : new Error(String(err)), {
          route: "/api/photos/[id]",
          method: "DELETE",
        })
      );
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
