import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { species, photos } from "@/db/schema";
import { eq, sql, desc, asc, and } from "drizzle-orm";
import { getThumbnailUrl } from "@/lib/storage";
import { getUserByUsername } from "@/lib/user";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

type SpeciesSortOption = "alpha" | "photo_count" | "recent_added" | "recent_taken";

/**
 * GET /api/public/gallery/[username]/species
 * List all species for a public gallery with photo counts
 * Note: Excludes Haikubox detection data (location-sensitive)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const { username } = await params;

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
    const searchParams = request.nextUrl.searchParams;
    const sort = (searchParams.get("sort") || "alpha") as SpeciesSortOption;

    // Build sort order
    const getOrderBy = () => {
      switch (sort) {
        case "photo_count":
          return [desc(sql`count(${photos.id})`), asc(species.commonName)];
        case "recent_added":
          return [desc(species.createdAt), asc(species.commonName)];
        case "recent_taken":
          return [desc(sql`max(${photos.originalDateTaken})`), asc(species.commonName)];
        case "alpha":
        default:
          return [asc(species.commonName)];
      }
    };

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
      .where(eq(species.userId, userId))
      .groupBy(species.id)
      .orderBy(...getOrderBy());

    // Get cover photo and latest photo thumbnail for each species
    // Note: Excludes Haikubox detection data for public view
    const speciesWithExtras = await Promise.all(
      result.map(async (s) => {
        // Get cover photo if set
        let coverPhoto = null;
        if (s.coverPhotoId) {
          const cover = await db
            .select({
              id: photos.id,
              thumbnailFilename: photos.thumbnailFilename,
            })
            .from(photos)
            .where(and(
              eq(photos.id, s.coverPhotoId),
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

        // Get latest photo as fallback
        const latestPhotoResult = await db
          .select({
            id: photos.id,
            thumbnailFilename: photos.thumbnailFilename,
          })
          .from(photos)
          .where(and(
            eq(photos.speciesId, s.id),
            eq(photos.userId, userId)
          ))
          .orderBy(desc(photos.uploadDate))
          .limit(1);

        const latestPhoto = latestPhotoResult[0]
          ? {
              id: latestPhotoResult[0].id,
              thumbnailUrl: getThumbnailUrl(latestPhotoResult[0].thumbnailFilename),
            }
          : null;

        // Note: Explicitly NOT including Haikubox data in public view
        return {
          ...s,
          coverPhoto,
          latestPhoto,
          // No haikuboxYearlyCount or haikuboxLastHeard for public view
        };
      })
    );

    const response = NextResponse.json({ species: speciesWithExtras });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching public species", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/public/gallery/[username]/species",
      method: "GET"
    });
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}
