---
name: seed-species
description: Generate realistic test fixtures matching the BirdFeed database schema. Use when writing tests or seeding development data.
disable-model-invocation: true
user-invocable: true
argument-hint: [table-name or "all"]
---

# Test Data Generator

Generate realistic test fixtures for: `$ARGUMENTS`

## Database Schema Reference

Read `src/db/schema.ts` for the current schema. Key tables and their constraints:

### users
```typescript
{
  id: text,              // Clerk user ID (e.g., "user_test_123")
  clerkId: text,         // Same as id
  email: text,
  firstName: text | null,
  lastName: text | null,
  displayName: text | null, // Required for onboarded users
  username: text | null,    // Unique, lowercase, 3-20 chars
  isPublicGalleryEnabled: boolean, // default: false
  isDirectoryListed: boolean,      // default: false
  city: text | null,
  state: text | null,     // 2-letter US state code
}
```

### species
```typescript
{
  id: serial,
  userId: text,          // FK → users.id (CASCADE)
  commonName: text,      // e.g., "Northern Cardinal"
  scientificName: text | null,
  description: text | null,
  rarity: text,          // "common" | "uncommon" | "rare"
  coverPhotoId: integer | null,
}
```

### photos
```typescript
{
  id: serial,
  userId: text,          // FK → users.id (CASCADE)
  speciesId: integer | null, // FK → species.id (CASCADE), null = unassigned
  filename: text,
  dateTaken: timestamp | null,
  isFavorite: boolean,   // default: false
  uploadDate: timestamp,
}
```
**Limits:** Max 8 photos per species, max 24 unassigned (see `src/config/limits.ts`).

### haikuboxDetections
```typescript
{
  id: serial,
  userId: text,
  speciesCommonName: text,
  totalDetections: integer,
  dataYear: integer,     // e.g., 2026
  speciesId: integer | null, // FK → species.id (SET NULL)
}
```
**Unique constraint:** `(userId, speciesCommonName, dataYear)`

### haikuboxActivityLog
```typescript
{
  id: serial,
  userId: text,
  speciesCommonName: text,
  detectedAt: timestamp,
  confidence: real | null,
  hourOfDay: integer,    // 0-23
}
```

### bookmarks
```typescript
{
  id: serial,
  userId: text,           // FK → users.id (CASCADE) — the bookmarker
  bookmarkedUserId: text, // FK → users.id (CASCADE) — the gallery owner
}
```
**Unique constraint:** `(userId, bookmarkedUserId)`

## Realistic Bird Species Data

Use these common North American birds for test data:
- Common: Northern Cardinal, Blue Jay, American Robin, House Sparrow, Mourning Dove
- Uncommon: Cedar Waxwing, Red-bellied Woodpecker, Eastern Bluebird, Brown Thrasher
- Rare: Painted Bunting, Prothonotary Warbler, Cerulean Warbler

## Output Format

Generate the fixtures as TypeScript objects ready to use with Drizzle `db.insert()`:
```typescript
import { users, species, photos } from "@/db/schema";

const testUsers = [{ ... }];
const testSpecies = [{ ... }];
const testPhotos = [{ ... }];

// Usage: await db.insert(users).values(testUsers);
```

## Reference Files
- Schema: `src/db/schema.ts`
- Limits: `src/config/limits.ts`
- DB patterns: `src/db/CLAUDE.md`
