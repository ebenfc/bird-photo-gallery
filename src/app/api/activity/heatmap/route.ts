import { NextRequest, NextResponse } from "next/server";
import { getAllSpeciesHeatmap } from "@/lib/activity";

// GET /api/activity/heatmap - Get all species activity heatmap data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysBack = parseInt(searchParams.get("days") || "30");

    const heatmapData = await getAllSpeciesHeatmap(daysBack);

    return NextResponse.json({
      heatmap: heatmapData,
      daysAnalyzed: daysBack,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching heatmap:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 }
    );
  }
}
