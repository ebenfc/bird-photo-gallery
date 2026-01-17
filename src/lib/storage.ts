import { getPublicUrl, deleteFromStorage } from "./supabase";

/**
 * Get the public URL for an original image
 */
export function getOriginalUrl(filename: string): string {
  return getPublicUrl(`originals/${filename}`);
}

/**
 * Get the public URL for a thumbnail image
 */
export function getThumbnailUrl(filename: string): string {
  return getPublicUrl(`thumbnails/${filename}`);
}

/**
 * Delete photo files from Supabase Storage
 */
export async function deletePhotoFiles(
  filename: string,
  thumbnailFilename: string
): Promise<void> {
  await deleteFromStorage(`originals/${filename}`);
  await deleteFromStorage(`thumbnails/${thumbnailFilename}`);
}
