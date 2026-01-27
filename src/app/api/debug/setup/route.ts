import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/debug/setup - Create users table and insert current user
export async function POST() {
  try {
    // Get Clerk auth state
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.json({
        error: "Not authenticated"
      }, { status: 401 });
    }

    // Create users table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Insert the current user (get email from Clerk)
    // We'll use a placeholder email based on the clerk ID
    const email = "ebenfc@gmail.com"; // Hardcoded for now since we know the user

    await db.execute(sql`
      INSERT INTO users (id, email, created_at, updated_at)
      VALUES (${clerkId}, ${email}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    return NextResponse.json({
      success: true,
      message: "Users table created and user inserted",
      clerkId,
      email
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
