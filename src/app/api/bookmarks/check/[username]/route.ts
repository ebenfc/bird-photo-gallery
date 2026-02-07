import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserByUsername } from "@/lib/user";

export const runtime = "nodejs";

/**
 * GET /api/bookmarks/check/[username]
 * Check if the current user has bookmarked a specific gallery
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { username } = await params;

    const targetUser = await getUserByUsername(username);
    if (!targetUser) {
      return NextResponse.json({ bookmarked: false });
    }

    const existing = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.bookmarkedUserId, targetUser.id)
        )
      );

    return NextResponse.json({ bookmarked: existing.length > 0 });
  } catch (error) {
    console.error("Failed to check bookmark:", error);
    return NextResponse.json(
      { error: "Failed to check bookmark" },
      { status: 500 }
    );
  }
}
