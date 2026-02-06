import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { species, photos, haikuboxDetections, Rarity } from "@/db/schema";
import { eq, sql, desc, asc, and, inArray } from "drizzle-orm";
import { getThumbnailUrl } from "@/lib/storage";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { SpeciesSchema, validateRequest } from "@/lib/validation";
import { invalidateSpeciesCache } from "@/lib/cache";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SpeciesSortOption = "alpha" | "photo_count" | "recent_added" | "recent_taken";

// GET /api/species - List all species with photo counts
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

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
      .leftJoin(photos, and(
        eq(photos.speciesId, species.id),
        eq(photos.userId, userId)
      ))
      .where(eq(species.userId, userId))
      .groupBy(species.id)
      .orderBy(...getOrderBy());

    // Batch-load cover photos, latest photos, and Haikubox detections (avoids N+1 queries)
    const currentYear = new Date().getFullYear();
    const speciesIds = result.map((s) => s.id);

    // 1. Batch fetch cover photos for species that have one set
    const coverPhotoIds = result
      .map((s) => s.coverPhotoId)
      .filter((id): id is number => id !== null);

    const coverPhotosMap = new Map<number, { id: number; thumbnailUrl: string }>();
    if (coverPhotoIds.length > 0) {
      const coverPhotos = await db
        .select({ id: photos.id, thumbnailFilename: photos.thumbnailFilename })
        .from(photos)
        .where(and(inArray(photos.id, coverPhotoIds), eq(photos.userId, userId)));
      for (const cp of coverPhotos) {
        coverPhotosMap.set(cp.id, { id: cp.id, thumbnailUrl: getThumbnailUrl(cp.thumbnailFilename) });
      }
    }

    // 2. Batch fetch latest photo per species (one query using DISTINCT ON)
    const latestPhotosMap = new Map<number, { id: number; thumbnailUrl: string }>();
    if (speciesIds.length > 0) {
      const latestPhotos = await db.execute(sql`
        SELECT DISTINCT ON (species_id) id, species_id, thumbnail_filename
        FROM photos
        WHERE species_id = ANY(${speciesIds}) AND user_id = ${userId}
        ORDER BY species_id, upload_date DESC
      `);
      for (const row of latestPhotos.rows) {
        const r = row as { id: number; species_id: number; thumbnail_filename: string };
        latestPhotosMap.set(r.species_id, {
          id: r.id,
          thumbnailUrl: getThumbnailUrl(r.thumbnail_filename),
        });
      }
    }

    // 3. Batch fetch Haikubox detections for all species this year
    const detectionsMap = new Map<number, { yearlyCount: number; lastHeardAt: Date | null }>();
    if (speciesIds.length > 0) {
      const detections = await db
        .select({
          speciesId: haikuboxDetections.speciesId,
          yearlyCount: haikuboxDetections.yearlyCount,
          lastHeardAt: haikuboxDetections.lastHeardAt,
        })
        .from(haikuboxDetections)
        .where(
          and(
            inArray(haikuboxDetections.speciesId, speciesIds),
            eq(haikuboxDetections.userId, userId),
            eq(haikuboxDetections.dataYear, currentYear)
          )
        );
      for (const d of detections) {
        if (d.speciesId !== null) {
          detectionsMap.set(d.speciesId, { yearlyCount: d.yearlyCount, lastHeardAt: d.lastHeardAt });
        }
      }
    }

    // Combine results in memory
    const speciesWithExtras = result.map((s) => {
      const coverPhoto = s.coverPhotoId ? (coverPhotosMap.get(s.coverPhotoId) || null) : null;
      const latestPhoto = latestPhotosMap.get(s.id) || null;
      const detection = detectionsMap.get(s.id);
      return {
        ...s,
        coverPhoto,
        latestPhoto,
        haikuboxYearlyCount: detection?.yearlyCount || null,
        haikuboxLastHeard: detection?.lastHeardAt || null,
      };
    });

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

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

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
        userId,
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
