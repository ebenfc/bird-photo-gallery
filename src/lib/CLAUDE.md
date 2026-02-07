# Utilities & Business Logic (`src/lib/`)

Server-side utility modules. Most are server-only — do not import from client components unless noted.

## Module Overview

| File | Purpose |
|------|---------|
| `authHelpers.ts` | `requireAuth()`, `isErrorResponse()`, `getCurrentUserId()` — used in every authenticated API route |
| `user.ts` | User DB operations: `getOrCreateUser`, `getUserByUsername`, `isUsernameAvailable`, `validateUsername` |
| `validation.ts` | Zod schemas for all request validation. Use `validateRequest()` or `validateSearchParams()` helpers |
| `photoLimits.ts` | `checkSpeciesLimit()`, `checkUnassignedLimit()` — enforces 8-per-species and 24-unassigned caps |
| `haikubox.ts` | Haikubox API client. Reads serial from DB via `settings.ts`, falls back to env var |
| `activity.ts` | Activity log storage and queries: hourly patterns, peak hours, "active now" predictions |
| `settings.ts` | Key-value settings backed by `app_settings` table. `getHaikuboxSerial()` is the main consumer |
| `image.ts` | Sharp image processing: EXIF extraction, JPEG conversion, thumbnail generation |
| `fileValidation.ts` | Client + server file validation: MIME types, size limits, magic byte checks |
| `storage.ts` | Supabase URL helpers: `getOriginalUrl()`, `getThumbnailUrl()`, `deletePhotoFiles()` |
| `supabase.ts` | Low-level Supabase storage client (upload, delete, public URL via native fetch) |
| `wikipedia.ts` | Wikipedia API lookup for bird species: scientific name extraction, description summarization |
| `suggestions.ts` | Photography suggestions scored by detection frequency, photo deficit, recency, and rarity |
| `agreement.ts` | User agreement tracking: `hasAcceptedCurrentAgreement()`, `acceptAgreement()` |
| `slack.ts` | Slack webhook for issue reports (Block Kit formatting). Server-only |
| `cache.ts` | In-memory TTL cache (singleton). Use `getOrFetch()` for cache-aside pattern |
| `rateLimit.ts` | In-memory rate limiter with preset tiers: `read` (100/min), `write` (20/min), `upload` (10/min), `sync` (5/min) |
| `logger.ts` | Structured logging with Sentry integration. Use `logError()` (auto-reports to Sentry in production) |

## Key Patterns

**Auth in API routes:** Always use `requireAuth()` + `isErrorResponse()` from `authHelpers.ts`. See `api/CLAUDE.md` for the full pattern.

**Validation:** Define Zod schemas in `validation.ts`, use `validateRequest(schema, data)` in routes. Export `type FooInput = z.infer<typeof FooSchema>` for TypeScript types.

**Storage paths:** Originals at `originals/{uuid}.jpg`, thumbnails at `thumbnails/{uuid}_thumb.jpg`. Use `storage.ts` helpers for URLs, `supabase.ts` for upload/delete.

**Haikubox name matching:** Use `normalizeCommonName()` from `haikubox.ts` when comparing bird names (handles Unicode apostrophes, case, whitespace).

**Cache invalidation:** After any mutation (create/update/delete), call the appropriate `invalidate*Cache()` from `cache.ts`. Forgetting this causes stale data.

## Tests

Tests live in `__tests__/` subdirectory. 4 pre-existing failures in `image.test.ts` are known and non-blocking.
