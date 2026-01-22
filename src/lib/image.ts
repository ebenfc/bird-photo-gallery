import exifr from "exifr";
import { randomUUID } from "crypto";
import { uploadToStorage } from "./supabase";

export interface ProcessedImage {
  filename: string;
  thumbnailFilename: string;
  originalDateTaken: Date | null;
}

// Sharp import state tracking
type SharpInstance = typeof import("sharp");
let sharpModule: SharpInstance | null = null;
let sharpImportAttempted = false;
let sharpImportError: string | null = null;

async function getSharp(): Promise<SharpInstance | null> {
  // Only attempt import once
  if (!sharpImportAttempted) {
    sharpImportAttempted = true;
    try {
      const sharpLib = await import("sharp");
      const sharp = sharpLib.default;
      // Configure for serverless
      sharp.cache(false);
      sharp.concurrency(1);
      sharpModule = sharp;
      console.log("Sharp loaded successfully");
    } catch (e) {
      sharpImportError = e instanceof Error ? e.message : String(e);
      console.error("Sharp import failed:", sharpImportError);
      sharpModule = null;
    }
  }
  return sharpModule;
}

export async function processUploadedImage(
  buffer: Buffer
): Promise<ProcessedImage> {
  const id = randomUUID();

  // Validate buffer
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty buffer provided for image processing");
  }

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

  // Try to use sharp for processing
  const sharp = await getSharp();

  let originalBuffer: Buffer;
  let thumbnailBuffer: Buffer;
  let ext = ".jpg";
  let contentType = "image/jpeg";
  let usedFallback = false;

  if (sharp) {
    try {
      // Process original (convert to JPEG)
      originalBuffer = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .jpeg({ quality: 90 })
        .toBuffer();

      // Generate thumbnail
      thumbnailBuffer = await sharp(buffer, { failOn: 'none' })
        .rotate()
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      console.log("Sharp processing successful");
    } catch (sharpError) {
      const errorMsg = sharpError instanceof Error ? sharpError.message : String(sharpError);
      console.error("Sharp processing failed, using fallback:", errorMsg);
      usedFallback = true;
      originalBuffer = buffer;
      thumbnailBuffer = buffer;
      const format = detectImageFormat(buffer);
      ext = format.ext;
      contentType = format.contentType;
    }
  } else {
    // Sharp not available, upload original
    console.warn(`Sharp not available (${sharpImportError || 'unknown reason'}), uploading original image`);
    usedFallback = true;
    originalBuffer = buffer;
    thumbnailBuffer = buffer;
    const format = detectImageFormat(buffer);
    ext = format.ext;
    contentType = format.contentType;
  }

  const filename = `${id}${ext}`;
  const thumbnailFilename = `${id}_thumb${ext}`;

  console.log(`Uploading image: ${filename} (fallback: ${usedFallback}, size: ${originalBuffer.length} bytes)`);

  // Upload to Supabase Storage
  try {
    await uploadToStorage(originalBuffer, `originals/${filename}`, contentType);
    console.log(`Original uploaded: originals/${filename}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Storage upload failed for original: ${errorMsg}`);
  }

  try {
    await uploadToStorage(thumbnailBuffer, `thumbnails/${thumbnailFilename}`, contentType);
    console.log(`Thumbnail uploaded: thumbnails/${thumbnailFilename}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Storage upload failed for thumbnail: ${errorMsg}`);
  }

  return { filename, thumbnailFilename, originalDateTaken };
}

function detectImageFormat(buffer: Buffer): { ext: string; contentType: string } {
  if (buffer.length < 4) {
    return { ext: ".jpg", contentType: "image/jpeg" };
  }

  const b0 = buffer[0];
  const b1 = buffer[1];
  const b2 = buffer[2];
  const b3 = buffer[3];
  const b8 = buffer[8];
  const b9 = buffer[9];
  const b10 = buffer[10];
  const b11 = buffer[11];

  // JPEG: FF D8 FF
  if (b0 === 0xFF && b1 === 0xD8 && b2 === 0xFF) {
    return { ext: ".jpg", contentType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47
  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4E && b3 === 0x47) {
    return { ext: ".png", contentType: "image/png" };
  }

  // WebP: RIFF....WEBP
  if (buffer.length >= 12 &&
      b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46 &&
      b8 === 0x57 && b9 === 0x45 && b10 === 0x42 && b11 === 0x50) {
    return { ext: ".webp", contentType: "image/webp" };
  }

  // GIF: GIF87a or GIF89a
  if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46) {
    return { ext: ".gif", contentType: "image/gif" };
  }

  // Default to JPEG
  return { ext: ".jpg", contentType: "image/jpeg" };
}
