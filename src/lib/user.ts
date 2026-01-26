import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Gets or creates a user in our database from Clerk user data
 * Used during webhook processing and auth checks
 */
export async function getOrCreateUser(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  imageUrl?: string;
}) {
  // Try to find existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id))
    .limit(1);

  if (existingUser[0]) {
    return existingUser[0];
  }

  // Create new user
  const result = await db
    .insert(users)
    .values({
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    })
    .returning();

  return result[0];
}

/**
 * Gets user ID from Clerk ID (they are the same in our schema)
 * Throws error if user not found
 */
export async function getUserIdFromClerkId(clerkId: string): Promise<string> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, clerkId))
    .limit(1);

  if (!result[0]) {
    throw new Error("User not found");
  }

  return result[0].id;
}

/**
 * Gets full user record from Clerk ID
 * Returns null if not found
 */
export async function getUserByClerkId(clerkId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkId))
    .limit(1);

  return result[0] || null;
}
