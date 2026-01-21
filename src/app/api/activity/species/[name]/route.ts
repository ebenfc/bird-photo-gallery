import { NextRequest, NextResponse } from "next/server";
import { getSpeciesActivityPattern } from "@/lib/activity";

// GET /api/activity/species/:name - Get activity pattern for a species
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const speciesName = decodeURIComponent(name);

    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get("days") || "90");

    const pattern = await getSpeciesActivityPattern(speciesName, daysBack);

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
