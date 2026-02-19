import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getOriginalUrl } from "@/lib/storage";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/photos/[id]/download
 * Download the original photo file. Owner-only — requires authentication.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.read);
  if (!rateCheck.allowed) {
    return rateCheck.response;
  }

  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId) || photoId <= 0) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    // Look up the photo — verify ownership
    const [photo] = await db
      .select({ filename: photos.filename })
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, userId)));

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Fetch the original image from Supabase storage
    const originalUrl = getOriginalUrl(photo.filename);
    const imageResponse = await fetch(originalUrl);

    if (!imageResponse.ok) {
      logError("Failed to fetch original from storage", new Error(`Storage returned ${imageResponse.status}`), {
        route: "/api/photos/[id]/download",
        method: "GET",
      });
      return NextResponse.json({ error: "Failed to fetch original photo" }, { status: 502 });
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageResponse.arrayBuffer();

    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${photo.filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });

    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.read);
  } catch (error) {
    logError("Error downloading photo", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/photos/[id]/download",
      method: "GET",
    });
    return NextResponse.json(
      { error: "Failed to download photo" },
      { status: 500 }
    );
  }
}
