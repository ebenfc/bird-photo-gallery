import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { db } from "@/db";
import { bookmarks, users, species, photos } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getUserByUsername } from "@/lib/user";

export const runtime = "nodejs";

/**
 * GET /api/bookmarks
 * List all bookmarks for the current user, with gallery info for each
 */
export async function GET(_request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    // Get all bookmarks with user info
    const userBookmarks = await db
      .select({
        bookmarkId: bookmarks.id,
        createdAt: bookmarks.createdAt,
        userId: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        city: users.city,
        state: users.state,
        isPublicGalleryEnabled: users.isPublicGalleryEnabled,
      })
      .from(bookmarks)
      .innerJoin(users, eq(bookmarks.bookmarkedUserId, users.id))
      .where(eq(bookmarks.userId, userId))
      .orderBy(users.firstName, users.username);

    // Filter to only public galleries (in case someone disabled after being bookmarked)
    const publicBookmarks = userBookmarks.filter((b) => b.isPublicGalleryEnabled);

    // Get species and photo counts for each bookmarked user
    const results = await Promise.all(
      publicBookmarks.map(async (bookmark) => {
        const [speciesResult] = await db
          .select({ count: count() })
          .from(species)
          .where(eq(species.userId, bookmark.userId));

        const [photoResult] = await db
          .select({ count: count() })
          .from(photos)
          .where(eq(photos.userId, bookmark.userId));

        const displayName = bookmark.firstName
          ? `${bookmark.firstName}${bookmark.lastName ? ` ${bookmark.lastName}` : ""}`
          : bookmark.username || "Bird Feed User";

        return {
          username: bookmark.username,
          displayName,
          city: bookmark.city,
          state: bookmark.state,
          speciesCount: speciesResult?.count ?? 0,
          photoCount: photoResult?.count ?? 0,
          bookmarkedAt: bookmark.createdAt,
        };
      })
    );

    return NextResponse.json({ bookmarks: results });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookmarks
 * Bookmark a gallery by username
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Look up the target user
    const targetUser = await getUserByUsername(username);
    if (!targetUser || !targetUser.isPublicGalleryEnabled) {
      return NextResponse.json(
        { error: "Gallery not found" },
        { status: 404 }
      );
    }

    // Can't bookmark yourself
    if (targetUser.id === userId) {
      return NextResponse.json(
        { error: "You cannot bookmark your own gallery" },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existing = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.bookmarkedUserId, targetUser.id)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Already bookmarked" },
        { status: 409 }
      );
    }

    await db.insert(bookmarks).values({
      userId,
      bookmarkedUserId: targetUser.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
