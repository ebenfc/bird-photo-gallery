import { NextRequest, NextResponse } from "next/server";
import { processUploadedImage } from "@/lib/image";
import { db } from "@/db";
import { photos } from "@/db/schema";

// POST /api/upload/browser - Upload a photo from browser (no API key needed)
export async function POST(request: NextRequest) {
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
    const fileName = photo.name.toLowerCase();
    const isValidType = validTypes.includes(photo.type.toLowerCase()) || fileName.endsWith(".heic") || fileName.endsWith(".heif");

    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Supported: JPEG, HEIC, PNG" },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    if (photo.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB" },
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

    return NextResponse.json({
      success: true,
      photoId: result[0].id,
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
