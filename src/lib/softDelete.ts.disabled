/**
 * Soft delete utilities for photos and species tables
 * Records are marked as deleted but not actually removed from the database
 */

import { db } from '@/db';
import { photos, species } from '@/db/schema';
import { eq, and, isNull, isNotNull, lt, sql } from 'drizzle-orm';

/**
 * Soft delete a photo
 */
export async function softDeletePhoto(id: number): Promise<boolean> {
  const result = await db
    .update(photos)
    .set({ deletedAt: new Date() })
    .where(and(eq(photos.id, id), isNull(photos.deletedAt)))
    .returning({ id: photos.id });

  return result.length > 0;
}

/**
 * Restore a soft-deleted photo
 */
export async function restorePhoto(id: number): Promise<boolean> {
  const result = await db
    .update(photos)
    .set({ deletedAt: null })
    .where(and(eq(photos.id, id), isNotNull(photos.deletedAt)))
    .returning({ id: photos.id });

  return result.length > 0;
}

/**
 * Soft delete a species (also soft deletes associated photos)
 */
export async function softDeleteSpecies(id: number): Promise<boolean> {
  // Soft delete all photos for this species first
  await db
    .update(photos)
    .set({ deletedAt: new Date() })
    .where(and(eq(photos.speciesId, id), isNull(photos.deletedAt)));

  // Soft delete the species
  const result = await db
    .update(species)
    .set({ deletedAt: null })
    .where(and(eq(species.id, id), isNull(species.deletedAt)))
    .returning({ id: species.id });

  return result.length > 0;
}

/**
 * Restore a soft-deleted species (also restores associated photos)
 */
export async function restoreSpecies(id: number): Promise<boolean> {
  // Restore the species
  const result = await db
    .update(species)
    .set({ deletedAt: null })
    .where(and(eq(species.id, id), isNotNull(species.deletedAt)))
    .returning({ id: species.id });

  if (result.length === 0) {
    return false;
  }

  // Restore all photos for this species
  await db
    .update(photos)
    .set({ deletedAt: null })
    .where(and(eq(photos.speciesId, id), isNotNull(photos.deletedAt)));

  return true;
}

/**
 * Permanently delete old soft-deleted photos
 * Call this in a cron job (e.g., delete after 30 days)
 */
export async function permanentlyDeleteOldPhotos(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(photos)
    .where(
      and(
        isNotNull(photos.deletedAt),
        lt(photos.deletedAt, cutoffDate)
      )
    )
    .returning({ id: photos.id });

  return result.length;
}

/**
 * Permanently delete old soft-deleted species
 * Call this in a cron job (e.g., delete after 30 days)
 */
export async function permanentlyDeleteOldSpecies(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await db
    .delete(species)
    .where(
      and(
        isNotNull(species.deletedAt),
        lt(species.deletedAt, cutoffDate)
      )
    )
    .returning({ id: species.id });

  return result.length;
}

/**
 * Filter condition for active (non-deleted) photos
 */
export const activePhotosFilter = isNull(photos.deletedAt);

/**
 * Filter condition for active (non-deleted) species
 */
export const activeSpeciesFilter = isNull(species.deletedAt);

/**
 * Get count of soft-deleted records
 */
export async function getDeletedRecordsCounts(): Promise<{
  photos: number;
  species: number;
}> {
  const photosCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(photos)
    .where(isNotNull(photos.deletedAt));

  const speciesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(species)
    .where(isNotNull(species.deletedAt));

  return {
    photos: Number(photosCount[0]?.count || 0),
    species: Number(speciesCount[0]?.count || 0)
  };
}
