import exifr from "exifr";
import { randomUUID } from "crypto";
import { uploadToStorage } from "./supabase";

export interface ProcessedImage {
  filename: string;
  thumbnailFilename: string;
  originalDateTaken: Date | null;
}

// Try to import and configure sharp, but don't fail if it's not available
let sharpModule: typeof import("sharp") | null = null;
async function getSharp() {
  if (sharpModule === null) {
    try {
      sharpModule = (await import("sharp")).default;
      sharpModule.cache(false);
      sharpModule.concurrency(1);
    } catch (e) {
      console.error("Sharp import failed:", e);
      sharpModule = undefined as unknown as typeof import("sharp");
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
    } catch (sharpError) {
      console.error("Sharp processing failed, using original:", sharpError);
      // Fall through to fallback
      originalBuffer = buffer;
      thumbnailBuffer = buffer;
      // Detect format from magic bytes
      const format = detectImageFormat(buffer);
      ext = format.ext;
      contentType = format.contentType;
    }
  } else {
    // Sharp not available, upload original
    console.warn("Sharp not available, uploading original image");
    originalBuffer = buffer;
    thumbnailBuffer = buffer;
    const format = detectImageFormat(buffer);
    ext = format.ext;
    contentType = format.contentType;
  }

  const filename = `${id}${ext}`;
  const thumbnailFilename = `${id}_thumb${ext}`;

  // Upload to Supabase Storage
  try {
    await uploadToStorage(originalBuffer, `originals/${filename}`, contentType);
  } catch (error) {
    throw new Error(`Storage upload failed for original: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    await uploadToStorage(thumbnailBuffer, `thumbnails/${thumbnailFilename}`, contentType);
  } catch (error) {
    throw new Error(`Storage upload failed for thumbnail: ${error instanceof Error ? error.message : String(error)}`);
  }

  return { filename, thumbnailFilename, originalDateTaken };
}

function detectImageFormat(buffer: Buffer): { ext: string; contentType: string } {
  if (buffer.length < 4) {
    return { ext: ".jpg", contentType: "image/jpeg" };
  }

  const bytes = buffer.subarray(0, 12);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { ext: ".jpg", contentType: "image/jpeg" };
  }

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return { ext: ".png", contentType: "image/png" };
  }

  // WebP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { ext: ".webp", contentType: "image/webp" };
  }

  // GIF: GIF87a or GIF89a
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { ext: ".gif", contentType: "image/gif" };
  }

  // Default to JPEG
  return { ext: ".jpg", contentType: "image/jpeg" };
}
