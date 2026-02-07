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
- Webhooks (`/api/webhook/clerk`) - No auth required
- Public gallery APIs (`/api/public/*`) - No auth required (see `public/CLAUDE.md`)

## Runtime Configuration

All routes must specify Node.js runtime (not Edge):

```typescript
export const runtime = "nodejs";
```

This is required for database access (pg driver) and sharp (image processing).

## Endpoint Overview

| Endpoint | Purpose |
|----------|---------|
| `/photos` | CRUD for photos |
| `/species` | CRUD for species |
| `/upload`, `/upload/browser` | Photo upload (API and browser) |
| `/haikubox/*` | Haikubox device integration |
| `/settings` | App settings (Haikubox serial) |
| `/settings/profile` | User profile (username, public gallery toggle) |
| `/public/gallery/[username]/*` | Public gallery read-only APIs |
| `/public/discover` | Browse directory-listed galleries |
| `/bookmarks` | GET (list) + POST (create) bookmarks |
| `/bookmarks/[username]` | DELETE bookmark |
| `/bookmarks/check/[username]` | Check if gallery is bookmarked |
| `/activity/*` | Species activity data |
| `/suggestions` | AI-powered suggestions |
| `/webhook/clerk` | Clerk user sync |
| `/support/report` | Issue reporting (POST → Slack webhook) |
| `/debug/*` | Development debugging |

## Haikubox Integration

- `/haikubox/test` - Validate serial number against Haikubox API
- `/haikubox/sync` - Sync detections from Haikubox
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

## Debug Endpoints

Available in all environments:
- `GET /api/debug/auth` - Check auth status and user database sync
- `POST /api/debug/setup` - Manually create current user in database
