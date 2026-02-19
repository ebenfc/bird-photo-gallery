# API Routes

All API routes follow these patterns.

## Authentication

Every authenticated route uses this pattern:

```typescript
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;
  // ... use userId for data isolation
}
```

**Exceptions:**
- Webhooks (`/api/webhook/clerk`) — No auth required
- Public gallery APIs (`/api/public/*`) — No auth required (see `public/CLAUDE.md`)
- Health check (`/api/health`) — Public, no auth
- Haikubox sync (`/api/haikubox/sync`) — Dual auth: Clerk for manual sync, `CRON_SECRET` for Vercel cron (see below)

## Runtime Configuration

All routes must specify Node.js runtime (not Edge):

```typescript
export const runtime = "nodejs";
```

This is required for database access (pg driver) and sharp (image processing).

## Endpoint Overview

| Endpoint | Purpose |
|----------|---------|
| `/photos` | List photos (GET), update/delete (PATCH/DELETE) |
| `/photos/[id]` | Single photo GET/PATCH/DELETE |
| `/photos/[id]/download` | Download original photo (GET, owner-only) |
| `/photos/unassigned` | List unassigned inbox photos |
| `/species` | List (GET) / create (POST) species |
| `/species/[id]` | Species detail GET/PATCH/DELETE |
| `/species/refresh` | Refresh Haikubox species data |
| `/upload/browser` | Browser photo upload |
| `/haikubox/*` | Haikubox device integration (see below) |
| `/settings` | App settings (Haikubox serial) |
| `/settings/profile` | User profile (username, public gallery toggle) |
| `/settings/profile/check-username` | Check username availability |
| `/public/gallery/[username]/*` | Public gallery read-only APIs |
| `/public/discover` | Browse directory-listed galleries |
| `/bookmarks` | GET (list) + POST (create) bookmarks |
| `/bookmarks/[username]` | DELETE bookmark |
| `/bookmarks/check/[username]` | Check if gallery is bookmarked |
| `/activity/*` | Species activity data (current, heatmap, species/[name]) |
| `/suggestions` | AI-powered suggestions |
| `/birds/lookup` | Bird name validation via Wikipedia |
| `/agreement` | Accept user agreement (POST) |
| `/webhook/clerk` | Clerk user sync |
| `/support/report` | Issue reporting (POST → Slack webhook) |
| `/health` | Health check (public, no auth) |

## Haikubox Integration

- `/haikubox/test` - Validate serial number against Haikubox API
- `/haikubox/sync` - Sync detections (manual POST or Vercel cron GET)
- `/haikubox/stats` - Get detection statistics
- `/haikubox/detections` - List detections
- `/haikubox/detections/link` - Link detections to species

Serial number is stored in `app_settings` table (key: `haikubox_serial`).

## Photo Limits

Per-species photo limit (8) and unassigned inbox cap (24) defined in `src/config/limits.ts`.
Server-side helpers in `src/lib/photoLimits.ts`: `checkSpeciesLimit()`, `checkUnassignedLimit()`.

- Upload and PATCH routes return **409** with `code: "SPECIES_AT_LIMIT"` or `"UNASSIGNED_AT_LIMIT"` when at capacity
- Photo swaps use `db.transaction()` for atomic delete-old + insert/update-new
- `replacePhotoId` parameter triggers swap; clears `coverPhotoId` if swapped photo was cover

## Haikubox Cron Auth

Vercel cron (`vercel.json`) hits `GET /api/haikubox/sync` daily at 6am UTC. Auth flow:
1. `proxy.ts` detects `vercel-cron` user-agent → bypasses Clerk entirely (`NextResponse.next()`)
2. Route handler checks `Authorization: Bearer <CRON_SECRET>` via `isCronRequest()`
3. On success: syncs all users with `haikubox_serial` in `appSettings`
4. On failure: returns 401 (never falls through to `requireAuth()` — Clerk wasn't loaded)
