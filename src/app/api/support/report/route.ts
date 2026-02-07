import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { checkRateLimit, createRateLimitResponse } from "@/lib/rateLimit";
import { validateRequest, ReportIssueSchema } from "@/lib/validation";
import { postIssueReport } from "@/lib/slack";
import { logInfo, logError } from "@/lib/logger";

export const runtime = "nodejs";

// Restrictive rate limit: 3 reports per 5 minutes per user
const REPORT_RATE_LIMIT = { maxRequests: 3, windowMs: 300_000 };

/**
 * POST /api/support/report
 * Submit an issue report that gets posted to the #support Slack channel.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  // Rate limit by userId (not IP) to prevent spam
  const rateLimitResult = checkRateLimit(
    `support-report:${userId}`,
    REPORT_RATE_LIMIT
  );
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, REPORT_RATE_LIMIT);
  }

  try {
    const body = await request.json();
    const validation = validateRequest(ReportIssueSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { issueType, description, pageUrl, userAgent } = validation.data;

    const result = await postIssueReport({
      issueType,
      description,
      pageUrl,
      userAgent,
      userId,
      submittedAt: new Date().toISOString(),
    });

    if (result.success) {
      logInfo("Issue report submitted", { userId, issueType });
      return NextResponse.json({ success: true });
    } else {
      logError("Failed to post issue report to Slack", undefined, { userId });
      return NextResponse.json(
        { error: result.error ?? "Failed to submit report. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    logError(
      "Issue report endpoint error",
      error instanceof Error ? error : undefined,
      { userId }
    );
    return NextResponse.json(
      { error: "Failed to submit report. Please try again." },
      { status: 500 }
    );
  }
}
