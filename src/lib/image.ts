import sharp from "sharp";
import exifr from "exifr";
import { randomUUID } from "crypto";
import { uploadToStorage } from "./supabase";

export interface ProcessedImage {
  filename: string;
  thumbnailFilename: string;
  originalDateTaken: Date | null;
}

export async function processUploadedImage(
  buffer: Buffer
): Promise<ProcessedImage> {
  const id = randomUUID();
  const ext = ".jpg";
  const filename = `${id}${ext}`;
  const thumbnailFilename = `${id}_thumb${ext}`;

  // Extract EXIF before any processing
  let originalDateTaken: Date | null = null;
  try {
    const exifData = await exifr.parse(buffer);
    if (exifData?.DateTimeOriginal) {
      originalDateTaken = new Date(exifData.DateTimeOriginal);
    }
  } catch {
    // EXIF extraction failed, continue without date
  }

  // Process original (convert HEIC if needed, always output as JPEG)
  let originalBuffer: Buffer;
  try {
    originalBuffer = await sharp(buffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch (error) {
    throw new Error(`Sharp processing failed for original: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Generate thumbnail (400px width, maintain aspect ratio)
  let thumbnailBuffer: Buffer;
  try {
    thumbnailBuffer = await sharp(buffer)
      .rotate()
      .resize(400, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw new Error(`Sharp processing failed for thumbnail: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Upload to Supabase Storage
  try {
    await uploadToStorage(originalBuffer, `originals/${filename}`);
  } catch (error) {
    throw new Error(`Storage upload failed for original: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    await uploadToStorage(thumbnailBuffer, `thumbnails/${thumbnailFilename}`);
  } catch (error) {
    throw new Error(`Storage upload failed for thumbnail: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { filename, thumbnailFilename, originalDateTaken };
}
