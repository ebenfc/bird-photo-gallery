import { db } from "../src/db";
import { users } from "../src/db/schema";

/**
 * Create a user record directly in the database
 * Usage: npx tsx scripts/create-user.ts <clerkId> <email> [firstName]
 */
async function createUser(clerkId: string, email: string, firstName?: string) {
  try {
    console.log(`\nCreating user: ${email} (${clerkId})\n`);

    const result = await db.insert(users).values({
      id: clerkId,
      email: email,
      firstName: firstName || null,
      lastName: null,
    }).returning();

    console.log("✅ User created successfully!");
    console.log(result[0]);
    process.exit(0);
  } catch (error: unknown) {
    const dbError = error as { code?: string };
    if (dbError.code === "23505") {
      console.log("User already exists in database");
      process.exit(0);
    }
    console.error("❌ Error creating user:", error);
    process.exit(1);
  }
}

const clerkId = process.argv[2];
const email = process.argv[3];
const firstName = process.argv[4];

if (!clerkId || !email) {
  console.error("Usage: npx tsx scripts/create-user.ts <clerkId> <email> [firstName]");
  process.exit(1);
}

createUser(clerkId, email, firstName);
