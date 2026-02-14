---
name: new-api-route
description: Scaffold a new authenticated API route following BirdFeed conventions. Use when creating a new API endpoint.
disable-model-invocation: true
user-invocable: true
argument-hint: [route-path HTTP-methods]
---

# New API Route

Create a new authenticated API route at `src/app/api/$ARGUMENTS`.

## Required Pattern

Every authenticated route MUST follow this exact structure:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  // All database queries MUST filter by userId for data isolation
  // ... implementation here

  return NextResponse.json({ /* response */ });
}

export const runtime = "nodejs";
```

## Checklist

1. **Create the route file** at the specified path under `src/app/api/`
2. **Include `export const runtime = "nodejs"`** — required for database access (pg driver) and sharp
3. **Use `requireAuth()` + `isErrorResponse()`** from `@/lib/authHelpers` for authentication
4. **Filter all DB queries by `userId`** — data isolation is mandatory
5. **Add Zod validation** if the route accepts request body or query params — define schema in `src/lib/validation.ts` and use `validateRequest()` or `validateSearchParams()`
6. **Add rate limiting** if appropriate — import from `src/lib/rateLimit.ts` (presets: `read` 100/min, `write` 20/min, `upload` 10/min, `sync` 5/min)
7. **Invalidate cache** after any mutation — call the appropriate `invalidate*Cache()` from `src/lib/cache.ts`
8. **Update `src/app/api/CLAUDE.md`** endpoint table with the new route

## Reference Files

- Auth pattern: `src/lib/authHelpers.ts`
- Validation: `src/lib/validation.ts`
- Rate limiting: `src/lib/rateLimit.ts`
- Cache: `src/lib/cache.ts`
- DB schema: `src/db/schema.ts`
- API conventions: `src/app/api/CLAUDE.md`

## Exceptions

If the route is **public** (no auth), use `/add-public-endpoint` instead.
If the route is a **webhook**, skip `requireAuth()` and verify the webhook signature directly.
