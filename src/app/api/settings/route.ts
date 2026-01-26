import { NextRequest, NextResponse } from "next/server";
import { setSetting, getSetting } from "@/lib/settings";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

/**
 * GET /api/settings
 * Get current settings
 */
export async function GET(_request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const haikuboxSerial = await getSetting(userId, "haikubox_serial");

    return NextResponse.json({
      haikuboxSerial: haikuboxSerial || null,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Save Haikubox serial number
 */
export async function POST(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { haikuboxSerial } = await request.json();

    if (!haikuboxSerial || typeof haikuboxSerial !== "string") {
      return NextResponse.json(
        { success: false, error: "Serial number required" },
        { status: 400 }
      );
    }

    // Validate serial format (alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(haikuboxSerial)) {
      return NextResponse.json(
        { success: false, error: "Invalid serial format (alphanumeric only)" },
        { status: 400 }
      );
    }

    await setSetting(userId, "haikubox_serial", haikuboxSerial);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
