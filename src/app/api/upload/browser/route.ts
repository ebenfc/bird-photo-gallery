import { NextRequest, NextResponse } from "next/server";
import { processUploadedImage } from "@/lib/image";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { validateImageFile, validateImageMagicBytesFromBuffer } from "@/lib/fileValidation";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { deletePhotoFiles } from "@/lib/storage";
import { checkSpeciesLimit, checkUnassignedLimit } from "@/lib/photoLimits";
import { SPECIES_PHOTO_LIMIT, UNASSIGNED_PHOTO_LIMIT } from "@/config/limits";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// POST /api/upload/browser - Upload a photo from browser
export async function POST(request: NextRequest) {
  // Rate limiting for uploads
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.upload);
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
    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;
    const speciesId = formData.get("speciesId") as string | null;
    const notes = formData.get("notes") as string | null;
    const replacePhotoIdStr = formData.get("replacePhotoId") as string | null;

    if (!photo) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Validate file using file validation module
    const fileValidation = validateImageFile(photo);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Validate notes length
    if (notes && notes.length > 500) {
      return NextResponse.json(
        { error: "Notes must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Parse and validate speciesId
    let parsedSpeciesId: number | null = null;
    if (speciesId) {
      parsedSpeciesId = parseInt(speciesId, 10);
      if (isNaN(parsedSpeciesId) || parsedSpeciesId <= 0) {
        return NextResponse.json(
          { error: "Invalid species ID" },
          { status: 400 }
        );
      }
    }

    // Parse and validate replacePhotoId
    let parsedReplaceId: number | null = null;
    if (replacePhotoIdStr) {
      parsedReplaceId = parseInt(replacePhotoIdStr, 10);
      if (isNaN(parsedReplaceId) || parsedReplaceId <= 0) {
        return NextResponse.json(
          { error: "Invalid replace photo ID" },
          { status: 400 }
        );
      }
    }

    // --- Photo limit checks ---
    if (parsedSpeciesId) {
      const limitCheck = await checkSpeciesLimit(parsedSpeciesId, userId, parsedReplaceId);
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
    } else {
      // Uploading without species — check unassigned inbox limit
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
    }

    // Process image (convert to JPEG, generate thumbnail, extract EXIF)
    let buffer: Buffer;
    try {
      buffer = Buffer.from(await photo.arrayBuffer());
    } catch (bufferError) {
      logError("Failed to read photo buffer", bufferError instanceof Error ? bufferError : new Error(String(bufferError)), {
        route: "/api/upload/browser",
        method: "POST",
        step: "buffer_read"
      });
      return NextResponse.json({ error: "Failed to read uploaded file" }, { status: 500 });
    }

    // Deep validation: check magic bytes to ensure it's actually an image
    if (!validateImageMagicBytesFromBuffer(buffer)) {
      return NextResponse.json(
        { error: "File appears to be corrupted or not a valid image" },
        { status: 400 }
      );
    }

    let processed;
    try {
      processed = await processUploadedImage(buffer);
    } catch (imageError) {
      logError("Failed to process image", imageError instanceof Error ? imageError : new Error(String(imageError)), {
        route: "/api/upload/browser",
        method: "POST",
        step: "image_processing"
      });
      return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
    }

    // Save to database (with optional swap via transaction)
    let insertedPhoto;
    let oldPhotoFiles: { filename: string; thumbnailFilename: string } | null = null;

    try {
      if (parsedReplaceId && parsedSpeciesId) {
        // Atomic swap: delete old photo + insert new one in a transaction
        const txResult = await db.transaction(async (tx) => {
          // Verify the replacement photo belongs to this user and species
          const [oldPhoto] = await tx
            .select({
              id: photos.id,
              filename: photos.filename,
              thumbnailFilename: photos.thumbnailFilename,
              speciesId: photos.speciesId,
            })
            .from(photos)
            .where(and(eq(photos.id, parsedReplaceId), eq(photos.userId, userId)));

          if (!oldPhoto) {
            throw new Error("REPLACE_PHOTO_NOT_FOUND");
          }
          if (oldPhoto.speciesId !== parsedSpeciesId) {
            throw new Error("REPLACE_PHOTO_WRONG_SPECIES");
          }

          // Clear coverPhotoId if the replaced photo was the cover
          const [speciesRecord] = await tx
            .select({ coverPhotoId: species.coverPhotoId })
            .from(species)
            .where(eq(species.id, parsedSpeciesId));

          if (speciesRecord?.coverPhotoId === parsedReplaceId) {
            await tx
              .update(species)
              .set({ coverPhotoId: null })
              .where(eq(species.id, parsedSpeciesId));
          }

          // Delete the old photo from DB
          await tx.delete(photos).where(eq(photos.id, parsedReplaceId));

          // Insert the new photo
          const [newPhoto] = await tx
            .insert(photos)
            .values({
              userId,
              speciesId: parsedSpeciesId,
              filename: processed.filename,
              thumbnailFilename: processed.thumbnailFilename,
              originalDateTaken: processed.originalDateTaken,
              notes: notes?.trim() || null,
            })
            .returning();

          return {
            newPhoto,
            oldFilename: oldPhoto.filename,
            oldThumbFilename: oldPhoto.thumbnailFilename,
          };
        });

        insertedPhoto = txResult.newPhoto;
        oldPhotoFiles = {
          filename: txResult.oldFilename,
          thumbnailFilename: txResult.oldThumbFilename,
        };
      } else {
        // Normal insert (no swap needed)
        const result = await db
          .insert(photos)
          .values({
            userId,
            speciesId: parsedSpeciesId,
            filename: processed.filename,
            thumbnailFilename: processed.thumbnailFilename,
            originalDateTaken: processed.originalDateTaken,
            notes: notes?.trim() || null,
          })
          .returning();

        insertedPhoto = result[0];
      }

      if (!insertedPhoto) {
        throw new Error("Failed to insert photo record - no result returned");
      }
    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);

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

      logError("Failed to save photo to database", dbError instanceof Error ? dbError : new Error(errorMsg), {
        route: "/api/upload/browser",
        method: "POST",
        step: "database_insert"
      });
      return NextResponse.json({ error: "Failed to save photo" }, { status: 500 });
    }

    // Clean up old photo files from storage (fire-and-forget, outside transaction)
    if (oldPhotoFiles) {
      deletePhotoFiles(oldPhotoFiles.filename, oldPhotoFiles.thumbnailFilename).catch((err) =>
        logError("Failed to clean up swapped photo files", err instanceof Error ? err : new Error(String(err)), {
          route: "/api/upload/browser",
          method: "POST",
          step: "storage_cleanup",
        })
      );
    }

    const response = NextResponse.json({
      success: true,
      photoId: insertedPhoto.id,
      needsSpecies: !speciesId,
      message: parsedReplaceId
        ? "Photo swapped successfully"
        : speciesId
          ? "Photo uploaded successfully"
          : "Photo uploaded - species assignment needed",
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.upload);
  } catch (error) {
    logError("Error uploading photo", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/upload/browser",
      method: "POST"
    });
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
