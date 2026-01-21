import { NextRequest, NextResponse } from "next/server";
import { getActiveNowSpecies } from "@/lib/activity";

// GET /api/activity/current - Get species typically active at current hour
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hourWindow = parseInt(searchParams.get("window") || "1");

    const activeSpecies = await getActiveNowSpecies(hourWindow);

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
