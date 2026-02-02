import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species, Rarity } from "@/db/schema";
import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";
import { getThumbnailUrl, getOriginalUrl } from "@/lib/storage";
import { getUserByUsername } from "@/lib/user";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

type SortOption = "recent_upload" | "oldest_upload" | "species_alpha" | "recent_taken";
const VALID_RARITIES: Rarity[] = ["common", "uncommon", "rare"];

/**
 * GET /api/public/gallery/[username]/photos
 * List photos for a public gallery with optional filtering
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
    const speciesId = searchParams.get("speciesId");
    const favorites = searchParams.get("favorites");
    const rarityParam = searchParams.get("rarity");
    const sort = (searchParams.get("sort") || "recent_upload") as SortOption;

    // Validate and parse pagination
    const pageStr = searchParams.get("page") || "1";
    const limitStr = searchParams.get("limit") || "50";
    const page = Math.max(1, parseInt(pageStr) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr) || 50));
    const offset = (page - 1) * limit;

    // Parse rarity filter
    const rarityFilter: Rarity[] = rarityParam
      ? (rarityParam.split(",").filter((r) => VALID_RARITIES.includes(r as Rarity)) as Rarity[])
      : [];

    // Build sort order
    const getOrderBy = () => {
      switch (sort) {
        case "oldest_upload":
          return [asc(photos.uploadDate), asc(photos.id)];
        case "species_alpha":
          return [asc(species.commonName), desc(photos.uploadDate)];
        case "recent_taken":
          return [sql`${photos.originalDateTaken} DESC NULLS LAST`, desc(photos.uploadDate)];
        case "recent_upload":
        default:
          return [desc(photos.uploadDate), desc(photos.id)];
      }
    };

    // Build where conditions
    const conditions = [eq(photos.userId, userId)];
    if (speciesId) {
      conditions.push(eq(photos.speciesId, parseInt(speciesId)));
    }
    if (favorites === "true") {
      conditions.push(eq(photos.isFavorite, true));
    }
    if (rarityFilter.length > 0) {
      conditions.push(inArray(species.rarity, rarityFilter));
    }

    const whereClause = and(...conditions);

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(photos);

    const countWithJoin = rarityFilter.length > 0
      ? countQuery.leftJoin(species, eq(photos.speciesId, species.id))
      : countQuery;

    const countResult = await countWithJoin.where(whereClause);
    const total = Number(countResult[0]?.count ?? 0);

    // Get photos with species info
    const result = await db
      .select({
        id: photos.id,
        filename: photos.filename,
        thumbnailFilename: photos.thumbnailFilename,
        uploadDate: photos.uploadDate,
        originalDateTaken: photos.originalDateTaken,
        dateTakenSource: photos.dateTakenSource,
        isFavorite: photos.isFavorite,
        notes: photos.notes,
        speciesId: photos.speciesId,
        speciesCommonName: species.commonName,
        speciesScientificName: species.scientificName,
        speciesDescription: species.description,
        speciesRarity: species.rarity,
      })
      .from(photos)
      .leftJoin(species, eq(photos.speciesId, species.id))
      .where(whereClause)
      .orderBy(...getOrderBy())
      .limit(limit)
      .offset(offset);

    // Add URLs to each photo (exclude notes for privacy in public view)
    const photosWithUrls = result.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      thumbnailFilename: photo.thumbnailFilename,
      thumbnailUrl: getThumbnailUrl(photo.thumbnailFilename),
      originalUrl: getOriginalUrl(photo.filename),
      uploadDate: photo.uploadDate,
      originalDateTaken: photo.originalDateTaken,
      dateTakenSource: photo.dateTakenSource,
      isFavorite: photo.isFavorite,
      // Note: Including notes in public view - they're part of the gallery content
      notes: photo.notes,
      species: photo.speciesId
        ? {
            id: photo.speciesId,
            commonName: photo.speciesCommonName,
            scientificName: photo.speciesScientificName,
            description: photo.speciesDescription,
            rarity: photo.speciesRarity as Rarity,
          }
        : null,
    }));

    const response = NextResponse.json({
      photos: photosWithUrls,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching public photos", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/public/gallery/[username]/photos",
      method: "GET"
    });
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
