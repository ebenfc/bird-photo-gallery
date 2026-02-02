import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos, species } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getUserByUsername } from "@/lib/user";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * GET /api/public/gallery/[username]
 * Get public profile info for a user's gallery
 * Returns display name, photo count, species count
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

    // Get photo count
    const photoCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(eq(photos.userId, user.id));
    const photoCount = Number(photoCountResult[0]?.count ?? 0);

    // Get species count
    const speciesCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(species)
      .where(eq(species.userId, user.id));
    const speciesCount = Number(speciesCountResult[0]?.count ?? 0);

    // Build display name
    const displayName = user.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
      : user.username || "Bird Feed User";

    const response = NextResponse.json({
      username: user.username,
      displayName,
      photoCount,
      speciesCount,
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error fetching public profile", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/public/gallery/[username]",
      method: "GET"
    });
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
