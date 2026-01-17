import sharp from "sharp";
import exifr from "exifr";
import { randomUUID } from "crypto";
import { uploadToStorage } from "./supabase";

export interface ProcessedImage {
  filename: string;
  thumbnailFilename: string;
  originalDateTaken: string | null;
}

export async function processUploadedImage(
  buffer: Buffer
): Promise<ProcessedImage> {
  const id = randomUUID();
  const ext = ".jpg";
  const filename = `${id}${ext}`;
  const thumbnailFilename = `${id}_thumb${ext}`;

  // Extract EXIF before any processing
  let originalDateTaken: string | null = null;
  try {
    const exifData = await exifr.parse(buffer);
    if (exifData?.DateTimeOriginal) {
      originalDateTaken = new Date(exifData.DateTimeOriginal).toISOString();
    }
  } catch {
    // EXIF extraction failed, continue without date
  }

  // Process original (convert HEIC if needed, always output as JPEG)
  const originalBuffer = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .jpeg({ quality: 90 })
    .toBuffer();

  // Generate thumbnail (400px width, maintain aspect ratio)
  const thumbnailBuffer = await sharp(buffer)
    .rotate()
    .resize(400, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload to Supabase Storage
  await uploadToStorage(originalBuffer, `originals/${filename}`);
  await uploadToStorage(thumbnailBuffer, `thumbnails/${thumbnailFilename}`);

  return { filename, thumbnailFilename, originalDateTaken };
}
