import { db } from "@/db";
import { species, haikuboxDetections, photos } from "@/db/schema";
import { eq, gte, sql } from "drizzle-orm";
import type { Rarity } from "@/types";

export interface Suggestion {
  id: number;
  commonName: string;
  scientificName: string | null;
  rarity: Rarity;
  score: number;
  reason: string;
  yearlyCount: number;
  photoCount: number;
  lastHeard: Date | null;
}

interface SuggestionData {
  id: number;
  commonName: string;
  scientificName: string | null;
  rarity: string;
  yearlyCount: number;
  lastHeard: Date | null;
  photoCount: number;
}

/**
 * Calculate priority score (0-100) for a species
 *
 * Scoring breakdown:
 * - Detection Score (0-40 points): Based on yearly detection frequency
 * - Deficit Score (0-40 points): Based on ratio of detections to photos
 * - Recency Bonus (0-15 points): Recently heard species get bonus
 * - Difficulty Modifier (-5 to +5): Based on rarity (common easier, rare harder)
 */
function calculatePriorityScore(
  yearlyCount: number,
  photoCount: number,
  lastHeard: Date | null,
  rarity: string
): number {
  // Detection Score (0-40 points)
  // Scale: More detections = higher priority
  // Cap at 250 detections for full points
  const detectionScore = Math.min(yearlyCount / 250, 1) * 40;

  // Deficit Score (0-40 points)
  // High detection count with low photo count = high score
  // Multiply photoCount by 10 to create meaningful deficit
  const deficitRatio = yearlyCount > 0
    ? Math.max(0, (yearlyCount - photoCount * 10) / yearlyCount)
    : 0;
  const deficitScore = deficitRatio * 40;

  // Recency Bonus (0-15 points)
  let recencyBonus = 0;
  if (lastHeard) {
    const hoursAgo = (Date.now() - lastHeard.getTime()) / (1000 * 60 * 60);
    if (hoursAgo <= 8) {
      recencyBonus = 15; // Heard in last 8 hours
    } else if (hoursAgo <= 24) {
      recencyBonus = 10; // Heard in last 24 hours
    } else if (hoursAgo <= 48) {
      recencyBonus = 5; // Heard in last 48 hours
    }
  }

  // Difficulty Modifier (-5 to +5)
  // Common species are easier to photograph (bonus)
  // Rare species are harder (penalty)
  const difficultyMod = rarity === "rare" ? -5 : rarity === "common" ? 5 : 0;

  const totalScore = detectionScore + deficitScore + recencyBonus + difficultyMod;
  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

/**
 * Generate human-readable reason for why species is a priority
 */
function generateReason(data: SuggestionData): string {
  // No photos yet - highest priority message
  if (data.photoCount === 0) {
    return "Not photographed yet - add to your collection!";
  }

  // Calculate capture rate (photos per 10 detections)
  const captureRate = (data.photoCount / (data.yearlyCount / 10)) * 100;

  // Low capture rate
  if (captureRate < 5) {
    return `Heard ${data.yearlyCount.toLocaleString()}x but only ${data.photoCount} photo${data.photoCount === 1 ? "" : "s"}`;
  }

  // Recently heard
  if (data.lastHeard) {
    const hoursAgo = (Date.now() - data.lastHeard.getTime()) / (1000 * 60 * 60);
    if (hoursAgo <= 8) {
      return "Active right now - go for it!";
    } else if (hoursAgo <= 24) {
      return "Heard recently - good chance to find it!";
    }
  }

  // Default: Frequent visitor
  return `Frequent visitor (${data.yearlyCount.toLocaleString()} detections this year)`;
}

/**
 * Get top photography suggestions
 * Returns species with high detection counts but low photo coverage
 *
 * @param limit - Maximum number of suggestions to return (default: 10)
 * @returns Array of suggestions sorted by priority score (highest first)
 */
export async function getPhotoSuggestions(limit: number = 10): Promise<Suggestion[]> {
  // Query: Join species + detections + photo counts
  // Only include species with at least 10 detections
  const results = await db
    .select({
      id: species.id,
      commonName: species.commonName,
      scientificName: species.scientificName,
      rarity: species.rarity,
      yearlyCount: haikuboxDetections.yearlyCount,
      lastHeard: haikuboxDetections.lastHeardAt,
      photoCount: sql<number>`COALESCE(COUNT(DISTINCT ${photos.id}), 0)::int`,
    })
    .from(species)
    .innerJoin(
      haikuboxDetections,
      eq(species.id, haikuboxDetections.speciesId)
    )
    .leftJoin(photos, eq(species.id, photos.speciesId))
    .where(
      gte(haikuboxDetections.yearlyCount, 10) // Minimum 10 detections
    )
    .groupBy(
      species.id,
      species.commonName,
      species.scientificName,
      species.rarity,
      haikuboxDetections.yearlyCount,
      haikuboxDetections.lastHeardAt
    );

  // Calculate scores and generate reasons
  const scored: Suggestion[] = results.map((r) => {
    const score = calculatePriorityScore(
      r.yearlyCount,
      r.photoCount,
      r.lastHeard,
      r.rarity
    );
    const reason = generateReason(r as SuggestionData);

    return {
      id: r.id,
      commonName: r.commonName,
      scientificName: r.scientificName,
      rarity: r.rarity as Rarity,
      score,
      reason,
      yearlyCount: r.yearlyCount,
      photoCount: r.photoCount,
      lastHeard: r.lastHeard,
    };
  });

  // Sort by score (highest first) and return top N
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
