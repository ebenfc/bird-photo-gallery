import { NextRequest, NextResponse } from "next/server";
import { lookupBirdFromWikipedia } from "@/lib/wikipedia";

// GET /api/birds/lookup?name=Dark-eyed Junco
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Name parameter is required (min 2 characters)" },
      { status: 400 }
    );
  }

  const result = await lookupBirdFromWikipedia(name.trim());

  if (!result) {
    return NextResponse.json(
      { error: "Bird not found", name: name.trim() },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
