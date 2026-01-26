import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

/**
 * POST /api/haikubox/test
 * Test Haikubox connection by validating serial number
 */
export async function POST(request: NextRequest) {
  // Authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }

  try {
    const { serial } = await request.json();

    if (!serial || typeof serial !== "string") {
      return NextResponse.json(
        { success: false, error: "Serial number required" },
        { status: 400 }
      );
    }

    // Validate serial format (alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(serial)) {
      return NextResponse.json(
        { success: false, error: "Invalid serial format (alphanumeric only)" },
        { status: 400 }
      );
    }

    // Test connection by calling Haikubox API
    const response = await fetch(
      `https://api.haikubox.com/haikubox/${serial}`,
      {
        next: { revalidate: 0 }, // Don't cache
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Device not found. Check your serial number." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Unable to connect to device" },
        { status: 400 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      deviceName: data.name || "Haikubox Device",
      serial: serial,
    });
  } catch (error) {
    console.error("Haikubox test connection error:", error);
    return NextResponse.json(
      { success: false, error: "Connection test failed. Please try again." },
      { status: 500 }
    );
  }
}
