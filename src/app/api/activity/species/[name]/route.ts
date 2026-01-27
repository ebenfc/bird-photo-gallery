import { NextRequest, NextResponse } from "next/server";
import { getSpeciesActivityPattern } from "@/lib/activity";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/activity/species/:name - Get activity pattern for a species
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { name } = await params;
    const speciesName = decodeURIComponent(name);

    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get("days") || "90");

    const pattern = await getSpeciesActivityPattern(userId, speciesName, daysBack);

    if (!pattern) {
      return NextResponse.json(
        { error: "No activity data found for this species" },
        { status: 404 }
      );
    }

    return NextResponse.json({ pattern });
  } catch (error) {
    console.error("Error fetching species activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 }
    );
  }
}
