import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// GET /api/debug/auth - Debug authentication state
export async function GET() {
  try {
    // Get Clerk auth state
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.json({
        step: "clerk_auth",
        error: "No Clerk userId in session",
        authResult: {
          userId: authResult.userId,
          sessionId: authResult.sessionId,
        }
      }, { status: 200 });
    }

    // Try to find user in database
    const userResult = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, clerkId))
      .limit(1);

    if (!userResult[0]) {
      return NextResponse.json({
        step: "database_lookup",
        error: "User not found in database",
        clerkId: clerkId,
        userFound: false
      }, { status: 200 });
    }

    return NextResponse.json({
      step: "success",
      clerkId: clerkId,
      userFound: true,
      userId: userResult[0].id,
      email: userResult[0].email
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      step: "error",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 200 });
  }
}
