import { NextRequest, NextResponse } from "next/server";
import { lookupBirdFromWikipedia } from "@/lib/wikipedia";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { BirdLookupSchema, validateSearchParams } from "@/lib/validation";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/birds/lookup?name=Dark-eyed Junco
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate input
    const validation = validateSearchParams(BirdLookupSchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    const result = await lookupBirdFromWikipedia(name);

    if (!result) {
      return NextResponse.json(
        { error: "Bird not found", name },
        { status: 404 }
      );
    }

    const response = NextResponse.json(result);
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error looking up bird", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/birds/lookup",
      method: "GET"
    });
    return NextResponse.json(
      { error: "Failed to lookup bird" },
      { status: 500 }
    );
  }
}
