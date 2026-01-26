import { auth } from '@clerk/nextjs/server';
import { getUserIdFromClerkId } from './user';
import { NextResponse } from 'next/server';

/**
 * Gets the current user's ID from the authenticated Clerk session
 * Returns null if not authenticated or user not found
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  try {
    return await getUserIdFromClerkId(clerkId);
  } catch {
    return null;
  }
}

/**
 * Gets the current user's ID or returns 401 response
 * Use this in API routes that require authentication
 *
 * @example
 * const authResult = await requireAuth();
 * if (isErrorResponse(authResult)) {
 *   return authResult; // Return the 401 response
 * }
 * const { userId } = authResult; // Use the userId
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return { userId };
}

/**
 * Type guard to check if the response is an error response
 * Use with requireAuth to narrow the type
 *
 * @example
 * const authResult = await requireAuth();
 * if (isErrorResponse(authResult)) {
 *   return authResult;
 * }
 * // TypeScript now knows authResult is { userId: string }
 * const { userId } = authResult;
 */
export function isErrorResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
