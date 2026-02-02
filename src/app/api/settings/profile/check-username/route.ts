import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { validateUsername, isUsernameAvailable } from "@/lib/user";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * GET /api/settings/profile/check-username?username=eben
 * Check if a username is available
 */
export async function GET(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter required" },
        { status: 400 }
      );
    }

    // Validate username format first
    const validation = validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        error: validation.error,
      });
    }

    // Check availability (excluding current user, so they can keep their own username)
    const normalizedUsername = username.toLowerCase();
    const available = await isUsernameAvailable(normalizedUsername, userId);

    return NextResponse.json({
      available,
      username: normalizedUsername,
    });
  } catch (error) {
    console.error("Failed to check username availability:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}
