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
| `appSettings` | User settings (key-value pairs) |
| `userAgreements` | Tracks user agreement acceptance (versioned) |

## Data Isolation

**All user data is isolated by `userId` field.** Every query must filter by the authenticated user's ID:

```typescript
const { userId } = authResult;
// Always include userId in queries
.where(eq(photos.userId, userId))
```

## Key Relationships

- `photos.speciesId` → `species.id` (cascade delete)
- `haikuboxDetections.speciesId` → `species.id` (set null on delete)
- All tables have `userId` → `users.id` (cascade delete)

## Users Table

The `users` table includes public gallery sharing fields:
- `username` (text, unique, nullable) - Public URL identifier (e.g., `/u/eben`)
- `isPublicGalleryEnabled` (boolean, default false) - Controls public gallery visibility

Use `src/lib/user.ts` functions for user operations:
- `getUserByUsername(username)` - Lookup by public username
- `isUsernameAvailable(username, excludeUserId?)` - Check availability
- `validateUsername(username)` - Validate format

## User Agreements Table

The `userAgreements` table tracks which version of the user agreement each user has accepted:
- `userId` (FK → users.id, cascade delete)
- `agreementVersion` (integer) — matches `CURRENT_AGREEMENT_VERSION` in schema.ts
- `acceptedAt` (timestamp)
- Unique constraint on `(userId, agreementVersion)`

To require re-acceptance after updating agreement text, bump `CURRENT_AGREEMENT_VERSION` in `schema.ts`.

Use `src/lib/agreement.ts` functions:
- `hasAcceptedCurrentAgreement(userId)` — Check acceptance status
- `acceptAgreement(userId)` — Record acceptance

## Rarity Type

```typescript
type Rarity = "common" | "uncommon" | "rare";
```

Rarity is user-defined, not auto-assigned. Unassigned Haikubox detections show as "Unassigned" in the UI.

## Commands

```bash
npm run db:push     # Push schema changes to database
npx drizzle-kit studio  # Open Drizzle Studio
```

For production, use the PUBLIC database URL (see project CLAUDE.md).

## Migrations

Located in `migrations/` folder. Drizzle handles migrations automatically with `db:push`.
