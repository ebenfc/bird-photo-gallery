import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/auth";
import { processUploadedImage } from "@/lib/image";
import { db } from "@/db";
import { photos } from "@/db/schema";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// POST /api/upload - Upload a photo (iOS Shortcut endpoint)
export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;
    const speciesId = formData.get("speciesId") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!photo) {
      return NextResponse.json({ error: "No photo provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/heic", "image/heif", "image/png"];
    if (!validTypes.includes(photo.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: JPEG, HEIC, PNG" },
        { status: 400 }
      );
    }

    // Process image (convert to JPEG, generate thumbnail, extract EXIF)
    const buffer = Buffer.from(await photo.arrayBuffer());
    const processed = await processUploadedImage(buffer);

    // Save to database
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

    const insertedPhoto = result[0];
    if (!insertedPhoto) {
      throw new Error("Failed to insert photo record");
    }

    return NextResponse.json({
      success: true,
      photoId: insertedPhoto.id,
      needsSpecies: !speciesId,
      message: speciesId
        ? "Photo uploaded successfully"
        : "Photo uploaded - species assignment needed",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error uploading photo:", errorMessage, error);
    return NextResponse.json(
      { error: "Failed to upload photo", details: errorMessage },
      { status: 500 }
    );
  }
}
