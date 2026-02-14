---
name: add-public-endpoint
description: Scaffold a new public API route (no auth) with visibility checks and rate limiting. Use for public gallery endpoints.
disable-model-invocation: true
user-invocable: true
argument-hint: [route-path]
---

# New Public API Endpoint

Create a new public (unauthenticated) API route at `src/app/api/public/$ARGUMENTS`.

## Required Pattern

Public routes differ from authenticated routes — no `requireAuth()`, but visibility checks are mandatory:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCachedUserByUsername } from "@/lib/user";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Rate limit
  const rateLimitResult = checkRateLimit(`public:${username}`, RATE_LIMITS.read);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Visibility check — MANDATORY for every public endpoint
  const user = await getCachedUserByUsername(username);
  if (!user || !user.isPublicGalleryEnabled) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  // All queries filter by profile owner's userId (not the visitor)
  // ... implementation here

  return NextResponse.json({ /* response */ });
}

export const runtime = "nodejs";
```

## Checklist

1. **No `requireAuth()`** — these routes are public
2. **Always use `getCachedUserByUsername()`** — not `getUserByUsername()`. The cached version uses `getOrFetchDeduped()` with 60s TTL to prevent DB pool exhaustion from crawler traffic
3. **Visibility check is mandatory** — verify `user.isPublicGalleryEnabled` is true
4. **Rate limiting** — use `RATE_LIMITS.read` (100 req/min)
5. **Filter by profile owner's userId** — data isolation still applies, just using the looked-up user's ID
6. **Never return sensitive data** — no Haikubox detections, email, Clerk ID, or internal fields
7. **Read-only** — public endpoints only support GET, never POST/PATCH/DELETE
8. **Update `src/app/api/public/CLAUDE.md`** with the new endpoint

## For the Discover endpoint pattern

The `/api/public/discover` route is different — it queries `isDirectoryListed` users (not a specific username). See `src/app/api/public/discover/route.ts` for the pattern.

## Middleware

Public routes must be listed in `src/proxy.ts` `isPublicRoute` matcher so Clerk doesn't require auth:
```typescript
createRouteMatcher([
  // ... existing routes
  "/api/public/(.*)",  // Already covered by this wildcard
])
```

## Reference Files

- Public API conventions: `src/app/api/public/CLAUDE.md`
- Cached user lookup: `src/lib/user.ts` → `getCachedUserByUsername()`
- Cache helpers: `src/lib/cache.ts` → `getOrFetchDeduped()`
- Rate limiting: `src/lib/rateLimit.ts`
- Middleware: `src/proxy.ts`
