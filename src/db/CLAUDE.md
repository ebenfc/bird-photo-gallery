# Database

Uses PostgreSQL with Drizzle ORM.

## Schema Location

All tables defined in `schema.ts`.

## Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (synced from Clerk) + public gallery settings |
| `species` | Bird species with rarity classification |
| `photos` | Uploaded photos linked to species |
| `haikuboxDetections` | Aggregated yearly detection counts |
| `haikuboxActivityLog` | Individual detection timestamps |
| `haikuboxSyncLog` | Sync operation history |
| `bookmarks` | Saved galleries (private, per-user) |
| `appSettings` | User settings (key-value pairs) |

## Data Isolation

**All user data is isolated by `userId` field.** Every query must filter by the authenticated user's ID:

```typescript
const { userId } = authResult;
// Always include userId in queries
.where(eq(photos.userId, userId))
```

## Indexes

Tables with performance indexes:
- `photos`: `user_id`, `species_id`, `upload_date`
- `species`: `user_id`
- `haikuboxDetections`: `user_id`, unique on `(user_id, species_common_name, data_year)`
- `haikuboxActivityLog`: unique on `(species_common_name, detected_at)`, `(species_common_name, hour_of_day)`, `detected_at`
- `bookmarks`: `user_id`, unique on `(user_id, bookmarked_user_id)`

## Key Relationships

- `photos.speciesId` → `species.id` (cascade delete)
- `haikuboxDetections.speciesId` → `species.id` (set null on delete)
- `bookmarks.userId` → `users.id` (cascade delete)
- `bookmarks.bookmarkedUserId` → `users.id` (cascade delete)
- All other tables have `userId` → `users.id` (cascade delete)

## Users Table

The `users` table includes public gallery sharing fields:
- `username` (text, unique, nullable) - Public URL identifier (e.g., `/u/eben`)
- `isPublicGalleryEnabled` (boolean, default false) - Controls public gallery visibility
- `isDirectoryListed` (boolean, default false) - Opt-in to Discover directory
- `city` (text, nullable) - Free-text city name
- `state` (text, nullable) - 2-letter US state code

Use `src/lib/user.ts` functions for user operations:
- `getUserByUsername(username)` - Lookup by public username
- `isUsernameAvailable(username, excludeUserId?)` - Check availability
- `validateUsername(username)` - Validate format

## Rarity Type

```typescript
type Rarity = "common" | "uncommon" | "rare";
```

Rarity is user-defined, not auto-assigned. Unassigned Haikubox detections show as "Unassigned" in the UI.

## Query Patterns

**Batch loading** — Use `inArray()` and `selectDistinctOn()` for batch queries instead of N+1 `Promise.all()` loops:

```typescript
// Good: Drizzle query builder with selectDistinctOn
const latestPhotos = await db
  .selectDistinctOn([photos.speciesId], { ... })
  .from(photos)
  .where(inArray(photos.speciesId, speciesIds));
```

**Avoid raw SQL for array parameters** — `db.execute(sql`...`)` with `ANY(${array})` fails silently due to array serialization issues. Always use Drizzle's `inArray()` instead.

## Commands

```bash
npm run db:push     # Push schema changes to database
npx drizzle-kit studio  # Open Drizzle Studio
```

For production, use the PUBLIC database URL (see project CLAUDE.md).

## Migrations

Located in `migrations/` folder. Drizzle handles migrations automatically with `db:push`.
