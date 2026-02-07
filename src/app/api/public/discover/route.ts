import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, species, photos } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { STATE_CODES } from "@/config/usStates";

export const runtime = "nodejs";

/**
 * GET /api/public/discover
 * Browse public, directory-listed galleries
 * Query params: state, sort (alpha|random), page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateFilter = searchParams.get("state");
    const sort = searchParams.get("sort") || "alpha";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    // Validate state filter
    if (stateFilter && !STATE_CODES.includes(stateFilter as (typeof STATE_CODES)[number])) {
      return NextResponse.json(
        { error: "Invalid state code" },
        { status: 400 }
      );
    }

    // Build conditions: must be public + directory-listed
    const conditions = [
      eq(users.isPublicGalleryEnabled, true),
      eq(users.isDirectoryListed, true),
    ];

    if (stateFilter) {
      conditions.push(eq(users.state, stateFilter));
    }

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(...conditions));

    const total = totalResult?.count ?? 0;

    // Get the directory-listed users
    const orderExpr = sort === "random"
      ? [sql`random()`]
      : [users.firstName, users.username];

    const listedUsers = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        city: users.city,
        state: users.state,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(...orderExpr)
      .limit(limit)
      .offset(offset);

    // Get species and photo counts for each user
    const galleries = await Promise.all(
      listedUsers.map(async (user) => {
        const [speciesResult] = await db
          .select({ count: count() })
          .from(species)
          .where(eq(species.userId, user.id));

        const [photoResult] = await db
          .select({ count: count() })
          .from(photos)
          .where(eq(photos.userId, user.id));

        const displayName = user.firstName
          ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
          : user.username || "Bird Feed User";

        return {
          username: user.username,
          displayName,
          city: user.city,
          state: user.state,
          speciesCount: speciesResult?.count ?? 0,
          photoCount: photoResult?.count ?? 0,
        };
      })
    );

    return NextResponse.json({
      galleries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch discover galleries:", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
}
