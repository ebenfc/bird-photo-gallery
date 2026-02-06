import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { SPECIES_PHOTO_LIMIT, UNASSIGNED_PHOTO_LIMIT } from "@/config/limits";

/**
 * Get the current photo count for a species belonging to a user.
 */
export async function getSpeciesPhotoCount(
  speciesId: number,
  userId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(photos)
    .where(and(eq(photos.speciesId, speciesId), eq(photos.userId, userId)));
  return Number(result[0]?.count ?? 0);
}

/**
 * Get the count of unassigned photos (no species) for a user.
 */
export async function getUnassignedPhotoCount(
  userId: string
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(photos)
    .where(and(eq(photos.userId, userId), isNull(photos.speciesId)));
  return Number(result[0]?.count ?? 0);
}

type LimitCheckResult =
  | { allowed: true; currentCount: number }
  | { allowed: false; currentCount: number; error: string };

/**
 * Check if a species has room for another photo, or if a replacePhotoId
 * is provided to swap one out.
 */
export async function checkSpeciesLimit(
  speciesId: number,
  userId: string,
  replacePhotoId?: number | null
): Promise<LimitCheckResult> {
  const currentCount = await getSpeciesPhotoCount(speciesId, userId);

  if (currentCount < SPECIES_PHOTO_LIMIT) {
    return { allowed: true, currentCount };
  }

  // At limit — replacePhotoId is required
  if (replacePhotoId) {
    return { allowed: true, currentCount };
  }

  return {
    allowed: false,
    currentCount,
    error: `This gallery is curated to ${SPECIES_PHOTO_LIMIT} photos. Choose one to swap out.`,
  };
}

/**
 * Check if the user's unassigned photo inbox has room.
 */
export async function checkUnassignedLimit(
  userId: string
): Promise<LimitCheckResult> {
  const currentCount = await getUnassignedPhotoCount(userId);

  if (currentCount < UNASSIGNED_PHOTO_LIMIT) {
    return { allowed: true, currentCount };
  }

  return {
    allowed: false,
    currentCount,
    error: `Your inbox has ${UNASSIGNED_PHOTO_LIMIT} photos waiting for a species. Assign some to make room for new uploads.`,
  };
}
