import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { species, photos } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getThumbnailUrl } from "@/lib/storage";
import { getUserByUsername } from "@/lib/user";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * GET /api/public/gallery/[username]/species/[id]
 * Get a single species detail for a public gallery
 * Note: Excludes Haikubox detection data (location-sensitive)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; id: string }> }
) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const { username, id } = await params;
    const speciesId = parseInt(id);

    if (isNaN(speciesId)) {
      return NextResponse.json(
        { error: "Invalid species ID" },
        { status: 400 }
      );
    }

    // Look up user by username
    const user = await getUserByUsername(username);

    // Return 404 if user not found or gallery not public
    if (!user || !user.isPublicGalleryEnabled) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Get species with photo count
    const result = await db
      .select({
        id: species.id,
        commonName: species.commonName,
        scientificName: species.scientificName,
        description: species.description,
        rarity: species.rarity,
        createdAt: species.createdAt,
        coverPhotoId: species.coverPhotoId,
        photoCount: sql<number>`count(${photos.id})`.as("photo_count"),
      })
      .from(species)
      .leftJoin(photos, and(
        eq(photos.speciesId, species.id),
        eq(photos.userId, userId)
      ))
      .where(and(
        eq(species.id, speciesId),
        eq(species.userId, userId)
      ))
      .groupBy(species.id)
      .limit(1);

    const speciesData = result[0];

    if (!speciesData) {
      return NextResponse.json(
        { error: "Species not found" },
        { status: 404 }
      );
    }

    // Get cover photo if set
    let coverPhoto = null;
    if (speciesData.coverPhotoId) {
      const cover = await db
        .select({
          id: photos.id,
          thumbnailFilename: photos.thumbnailFilename,
        })
        .from(photos)
        .where(and(
          eq(photos.id, speciesData.coverPhotoId),
          eq(photos.userId, userId)
        ))
        .limit(1);
      if (cover[0]) {
        coverPhoto = {
          id: cover[0].id,
          thumbnailUrl: getThumbnailUrl(cover[0].thumbnailFilename),
        };
      }
    }

    // Note: Explicitly NOT including Haikubox data in public view
    const response = NextResponse.json({
      species: {
        ...speciesData,
        coverPhoto,
        // No haikuboxYearlyCount or haikuboxLastHeard for public view
      },
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching public species detail", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/public/gallery/[username]/species/[id]",
      method: "GET"
    });
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}
