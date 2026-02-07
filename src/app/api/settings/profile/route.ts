import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { getUserByClerkId, validateUsername, isUsernameAvailable } from "@/lib/user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { STATE_CODES } from "@/config/usStates";

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
      isDirectoryListed: user.isDirectoryListed,
      city: user.city || null,
      state: user.state || null,
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
    const { username, isPublicGalleryEnabled, city, state, isDirectoryListed } = body;

    // Build update object
    const updates: Partial<{
      username: string | null;
      isPublicGalleryEnabled: boolean;
      isDirectoryListed: boolean;
      city: string | null;
      state: string | null;
    }> = {};

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

      // If disabling public gallery, also disable directory listing
      if (!isPublicGalleryEnabled) {
        updates.isDirectoryListed = false;
      }
    }

    // Handle city update
    if (city !== undefined) {
      if (city === null || city === "") {
        updates.city = null;
      } else {
        const trimmedCity = String(city).trim();
        if (trimmedCity.length > 100) {
          return NextResponse.json(
            { error: "City name must be 100 characters or less" },
            { status: 400 }
          );
        }
        updates.city = trimmedCity;
      }
    }

    // Handle state update
    if (state !== undefined) {
      if (state === null || state === "") {
        updates.state = null;
      } else {
        const upperState = String(state).toUpperCase();
        if (!STATE_CODES.includes(upperState as (typeof STATE_CODES)[number])) {
          return NextResponse.json(
            { error: "Invalid US state code" },
            { status: 400 }
          );
        }
        updates.state = upperState;
      }
    }

    // Handle directory listing toggle
    if (typeof isDirectoryListed === "boolean") {
      if (isDirectoryListed) {
        const user = await getUserByClerkId(userId);
        const finalPublicEnabled = updates.isPublicGalleryEnabled !== undefined
          ? updates.isPublicGalleryEnabled
          : user?.isPublicGalleryEnabled;

        if (!finalPublicEnabled) {
          return NextResponse.json(
            { error: "You must enable your public gallery before listing in the directory" },
            { status: 400 }
          );
        }
      }
      updates.isDirectoryListed = isDirectoryListed;
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
      isDirectoryListed: result[0].isDirectoryListed,
      city: result[0].city,
      state: result[0].state,
    });
  } catch (error) {
    console.error("Failed to update profile settings:", error);
    return NextResponse.json(
      { error: "Failed to update profile settings" },
      { status: 500 }
    );
  }
}
