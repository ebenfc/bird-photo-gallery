import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { getUserByClerkId, validateUsername, isUsernameAvailable } from "@/lib/user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * GET /api/settings/profile
 * Get current user's profile settings (username, public gallery status)
 */
export async function GET(_request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const user = await getUserByClerkId(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      username: user.username || null,
      isPublicGalleryEnabled: user.isPublicGalleryEnabled,
      displayName: user.firstName
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch profile settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings/profile
 * Update username and/or public gallery enabled status
 */
export async function PATCH(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { username, isPublicGalleryEnabled } = body;

    // Build update object
    const updates: Partial<{ username: string | null; isPublicGalleryEnabled: boolean }> = {};

    // Handle username update
    if (username !== undefined) {
      if (username === null || username === "") {
        // Allow clearing username
        updates.username = null;
      } else {
        // Validate username format
        const validation = validateUsername(username);
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error },
            { status: 400 }
          );
        }

        // Check if username is available (excluding current user)
        const normalizedUsername = username.toLowerCase();
        const available = await isUsernameAvailable(normalizedUsername, userId);
        if (!available) {
          return NextResponse.json(
            { error: "This username is already taken" },
            { status: 409 }
          );
        }

        updates.username = normalizedUsername;
      }
    }

    // Handle public gallery toggle
    if (typeof isPublicGalleryEnabled === "boolean") {
      // If enabling public gallery, ensure username is set
      if (isPublicGalleryEnabled) {
        const user = await getUserByClerkId(userId);
        const finalUsername = updates.username !== undefined ? updates.username : user?.username;

        if (!finalUsername) {
          return NextResponse.json(
            { error: "You must set a username before enabling your public gallery" },
            { status: 400 }
          );
        }
      }
      updates.isPublicGalleryEnabled = isPublicGalleryEnabled;
    }

    // If no updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    // Perform the update
    const result = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      username: result[0].username,
      isPublicGalleryEnabled: result[0].isPublicGalleryEnabled,
    });
  } catch (error) {
    console.error("Failed to update profile settings:", error);
    return NextResponse.json(
      { error: "Failed to update profile settings" },
      { status: 500 }
    );
  }
}
