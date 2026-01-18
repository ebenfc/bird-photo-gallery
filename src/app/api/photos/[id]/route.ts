import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getThumbnailUrl,
  getOriginalUrl,
  deletePhotoFiles,
} from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/photos/[id] - Get a single photo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
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
      })
      .from(photos)
      .leftJoin(species, eq(photos.speciesId, species.id))
      .where(eq(photos.id, photoId));

    if (result.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const photo = result[0];
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
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const body = await request.json();
    const { speciesId, isFavorite, notes, originalDateTaken } = body;

    const updateData: Record<string, unknown> = {};
    if (speciesId !== undefined) {
      updateData.speciesId = speciesId ? parseInt(speciesId) : null;
    }
    if (isFavorite !== undefined) {
      updateData.isFavorite = Boolean(isFavorite);
    }
    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }
    if (originalDateTaken !== undefined) {
      if (originalDateTaken === null) {
        updateData.originalDateTaken = null;
        updateData.dateTakenSource = "manual";
      } else {
        const parsedDate = new Date(originalDateTaken);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }
        // Validate date is not in the future
        if (parsedDate > new Date()) {
          return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
        }
        // Validate date is not before 1900
        if (parsedDate.getFullYear() < 1900) {
          return NextResponse.json({ error: "Date cannot be before 1900" }, { status: 400 });
        }
        updateData.originalDateTaken = parsedDate;
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

    return NextResponse.json({ photo: result[0] });
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/[id] - Delete a photo and its files
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    // Get photo info before deleting
    const photoToDelete = await db
      .select()
      .from(photos)
      .where(eq(photos.id, photoId));

    if (photoToDelete.length === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from database
    await db.delete(photos).where(eq(photos.id, photoId));

    // Delete files from Supabase Storage
    await deletePhotoFiles(
      photoToDelete[0].filename,
      photoToDelete[0].thumbnailFilename
    );

    return NextResponse.json({ success: true, deleted: photoToDelete[0] });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
