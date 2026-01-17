import { deleteFromStorage, BUCKET_NAME } from "./supabase";

/**
 * Get the public URL for a file in Supabase Storage
 * Constructs URL directly without needing Supabase client
 */
function getStorageUrl(path: string): string {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    // Fallback for build time - will be replaced at runtime
    return `/storage/${path}`;
  }
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

/**
 * Get the public URL for an original image
 */
export function getOriginalUrl(filename: string): string {
  return getStorageUrl(`originals/${filename}`);
}

/**
 * Get the public URL for a thumbnail image
 */
export function getThumbnailUrl(filename: string): string {
  return getStorageUrl(`thumbnails/${filename}`);
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
