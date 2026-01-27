import { NextRequest, NextResponse } from "next/server";
import { getPhotoSuggestions } from "@/lib/suggestions";
import {
  checkAndGetRateLimitResponse,
  addRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rateLimit";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/suggestions - Get photography suggestions
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) return rateCheck.response;

  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate limit parameter
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    const suggestions = await getPhotoSuggestions(userId, limit);

    const response = NextResponse.json({
      suggestions,
      topSuggestion: suggestions[0] || null,
      generatedAt: new Date().toISOString(),
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
