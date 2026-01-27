import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

// GET /api/debug/auth - Debug authentication state
export async function GET() {
  const debug: Record<string, unknown> = {};

  try {
    // Step 1: Get Clerk auth state
    const authResult = await auth();
    const clerkId = authResult.userId;
    debug.clerkId = clerkId;
    debug.sessionId = authResult.sessionId;

    if (!clerkId) {
      return NextResponse.json({
        step: "clerk_auth_failed",
        error: "No Clerk userId in session",
        debug
      }, { status: 200 });
    }

    // Step 2: Check if users table exists
    try {
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'users'
        ) as exists
      `);
      debug.usersTableExists = tableCheck.rows[0]?.exists;
    } catch (e) {
      debug.tableCheckError = e instanceof Error ? e.message : String(e);
    }

    // Step 3: Count users in table
    try {
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
      debug.userCount = countResult.rows[0]?.count;
    } catch (e) {
      debug.countError = e instanceof Error ? e.message : String(e);
    }

    // Step 4: Try to find this specific user
    try {
      const userResult = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, clerkId))
        .limit(1);

      if (userResult[0]) {
        debug.userFound = true;
        debug.userId = userResult[0].id;
        debug.email = userResult[0].email;
      } else {
        debug.userFound = false;
      }
    } catch (e) {
      debug.userLookupError = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      step: "complete",
      debug
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      step: "error",
      error: error instanceof Error ? error.message : String(error),
      debug
    }, { status: 200 });
  }
}
