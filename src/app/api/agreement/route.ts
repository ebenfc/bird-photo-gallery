import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { acceptAgreement } from "@/lib/agreement";

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = "nodejs";

/**
 * POST /api/agreement
 * Record that the current user has accepted the user agreement
 */
export async function POST() {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const agreement = await acceptAgreement(userId);

    return NextResponse.json({
      success: true,
      agreement,
    });
  } catch (error) {
    console.error("Failed to accept agreement:", error);
    return NextResponse.json(
      { error: "Failed to accept agreement" },
      { status: 500 }
    );
  }
}
