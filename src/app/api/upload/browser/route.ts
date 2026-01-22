import { NextRequest, NextResponse } from "next/server";
import { processUploadedImage } from "@/lib/image";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { validateImageFile, validateImageMagicBytesFromBuffer } from "@/lib/fileValidation";

// POST /api/upload/browser - Upload a photo from browser (no API key needed)
export async function POST(request: NextRequest) {
  // Rate limiting for uploads
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.upload);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;
    const speciesId = formData.get("speciesId") as string | null;
    const notes = formData.get("notes") as string | null;

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

    // Validate speciesId if provided
    if (speciesId) {
      const parsedId = parseInt(speciesId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        return NextResponse.json(
          { error: "Invalid species ID" },
          { status: 400 }
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

    // Save to database
    let insertedPhoto;
    try {
      const result = await db
        .insert(photos)
        .values({
          speciesId: speciesId ? parseInt(speciesId) : null,
          filename: processed.filename,
          thumbnailFilename: processed.thumbnailFilename,
          originalDateTaken: processed.originalDateTaken,
          notes: notes?.trim() || null,
        })
        .returning();

      insertedPhoto = result[0];
      if (!insertedPhoto) {
        throw new Error("Failed to insert photo record - no result returned");
      }
    } catch (dbError) {
      logError("Failed to save photo to database", dbError instanceof Error ? dbError : new Error(String(dbError)), {
        route: "/api/upload/browser",
        method: "POST",
        step: "database_insert"
      });
      return NextResponse.json({ error: "Failed to save photo" }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      photoId: insertedPhoto.id,
      needsSpecies: !speciesId,
      message: speciesId
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
