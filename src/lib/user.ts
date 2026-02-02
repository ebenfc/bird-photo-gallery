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

/**
 * Gets user by their public username
 * Used for public gallery access
 * Returns null if not found
 */
export async function getUserByUsername(username: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  return result[0] || null;
}

/**
 * Checks if a username is available (not already taken)
 * Returns true if available, false if taken
 */
export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  const normalizedUsername = username.toLowerCase();
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, normalizedUsername))
    .limit(1);

  // If no user found with this username, it's available
  if (!result[0]) {
    return true;
  }

  // If we're excluding a user (for update operations), check if it's the same user
  if (excludeUserId && result[0].id === excludeUserId) {
    return true;
  }

  return false;
}

/**
 * Validates username format
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateUsername(username: string): { valid: true } | { valid: false; error: string } {
  // Check length
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 30) {
    return { valid: false, error: "Username must be 30 characters or less" };
  }

  // Check format: lowercase alphanumeric and hyphens only
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username) && !/^[a-z0-9]$/.test(username)) {
    return {
      valid: false,
      error: "Username must start and end with a letter or number, and can only contain lowercase letters, numbers, and hyphens"
    };
  }

  // Check for consecutive hyphens
  if (/--/.test(username)) {
    return { valid: false, error: "Username cannot contain consecutive hyphens" };
  }

  // Check reserved words
  const reservedWords = [
    "api", "sign-in", "sign-up", "admin", "settings", "activity",
    "species", "resources", "feed", "u", "user", "users", "profile",
    "public", "private", "help", "support", "about", "contact"
  ];
  if (reservedWords.includes(username)) {
    return { valid: false, error: "This username is reserved" };
  }

  return { valid: true };
}
