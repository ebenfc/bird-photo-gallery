import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { species, photos, haikuboxDetections, Rarity } from "@/db/schema";
import { eq, sql, desc, asc, and } from "drizzle-orm";
import { getThumbnailUrl } from "@/lib/storage";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { SpeciesSchema, validateRequest } from "@/lib/validation";
import { invalidateSpeciesCache } from "@/lib/cache";

type SpeciesSortOption = "alpha" | "photo_count" | "recent_added" | "recent_taken";

// GET /api/species - List all species with photo counts
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
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
      .leftJoin(photos, eq(photos.speciesId, species.id))
      .groupBy(species.id)
      .orderBy(...getOrderBy());

    // Get cover photo, latest photo thumbnail, and Haikubox detection data for each species
    const currentYear = new Date().getFullYear();
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
            .where(eq(photos.id, s.coverPhotoId))
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
          .where(eq(photos.speciesId, s.id))
          .orderBy(desc(photos.uploadDate))
          .limit(1);

        const latestPhoto = latestPhotoResult[0]
          ? {
              id: latestPhotoResult[0].id,
              thumbnailUrl: getThumbnailUrl(latestPhotoResult[0].thumbnailFilename),
            }
          : null;

        // Get Haikubox detection data for this species
        const detection = await db
          .select({
            yearlyCount: haikuboxDetections.yearlyCount,
            lastHeardAt: haikuboxDetections.lastHeardAt,
          })
          .from(haikuboxDetections)
          .where(
            and(
              eq(haikuboxDetections.speciesId, s.id),
              eq(haikuboxDetections.dataYear, currentYear)
            )
          )
          .limit(1);

        return {
          ...s,
          coverPhoto,
          latestPhoto,
          haikuboxYearlyCount: detection[0]?.yearlyCount || null,
          haikuboxLastHeard: detection[0]?.lastHeardAt || null,
        };
      })
    );

    const response = NextResponse.json({ species: speciesWithExtras });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching species", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/species",
      method: "GET"
    });
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}

// POST /api/species - Create a new species
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.write);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const body = await request.json();

    // Validate input using Zod schema
    const validation = validateRequest(SpeciesSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { commonName, scientificName, description, rarity } = validation.data;

    const result = await db
      .insert(species)
      .values({
        commonName,
        scientificName: scientificName || null,
        description: description || null,
        rarity: rarity as Rarity,
      })
      .returning();

    const newSpecies = result[0];
    if (!newSpecies) {
      throw new Error("Failed to insert species record");
    }

    // Invalidate species cache
    invalidateSpeciesCache();

    const response = NextResponse.json({ species: newSpecies }, { status: 201 });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.write);
  } catch (error) {
    logError("Error creating species", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/species",
      method: "POST"
    });
    return NextResponse.json(
      { error: "Failed to create species" },
      { status: 500 }
    );
  }
}
