import { db } from "@/db";
import { userAgreements, CURRENT_AGREEMENT_VERSION } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Check if a user has accepted the current agreement version.
 * Returns true if accepted, false otherwise.
 *
 * @param userId - The Clerk user ID (same as users.id in our DB)
 */
export async function hasAcceptedCurrentAgreement(userId: string): Promise<boolean> {
  const result = await db
    .select({ id: userAgreements.id })
    .from(userAgreements)
    .where(
      and(
        eq(userAgreements.userId, userId),
        eq(userAgreements.agreementVersion, CURRENT_AGREEMENT_VERSION)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Record that a user has accepted the current agreement version.
 * Uses onConflictDoNothing to safely handle duplicate acceptance attempts.
 *
 * @param userId - The Clerk user ID
 */
export async function acceptAgreement(userId: string) {
  const result = await db
    .insert(userAgreements)
    .values({
      userId,
      agreementVersion: CURRENT_AGREEMENT_VERSION,
    })
    .onConflictDoNothing()
    .returning();

  return result[0];
}
