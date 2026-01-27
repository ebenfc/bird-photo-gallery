import { NextRequest, NextResponse } from "next/server";
import { getActiveNowSpecies } from "@/lib/activity";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

// GET /api/activity/current - Get species typically active at current hour
export async function GET(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const hourWindow = parseInt(searchParams.get("window") || "1");

    const activeSpecies = await getActiveNowSpecies(userId, hourWindow);

    return NextResponse.json({
      activeSpecies,
      currentHour: new Date().getHours(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching current activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch current activity" },
      { status: 500 }
    );
  }
}
