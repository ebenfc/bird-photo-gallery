# Clerk Authentication Integration - Session 1 Status

**Date**: January 25, 2026
**Status**: 60% Complete - Core infrastructure done, API routes pending

## What We've Completed ✅

### Phase 1: Foundation Setup
- [x] Installed packages: `@clerk/nextjs`, `svix`, `tsx`
- [x] Added Clerk environment variables to `.env.local` (keys need to be filled in)
- [x] Updated database schema with `users` table
- [x] Added `userId` fields to all tables (photos, species, appSettings, haikubox tables)
- [x] Pushed schema changes to database (userId nullable for now)

### Phase 2: Authentication Setup
- [x] Created middleware (`src/middleware.ts`) - protects all routes except sign-in/sign-up
- [x] Updated layout (`src/app/layout.tsx`) with `ClerkProvider`
- [x] Created sign-in page (`src/app/sign-in/[[...sign-in]]/page.tsx`)
- [x] Created sign-up page (`src/app/sign-up/[[...sign-up]]/page.tsx`)
- [x] Updated Header component with `UserButton` (desktop and mobile)

### Phase 3: User Management
- [x] Created user service (`src/lib/user.ts`) - sync between Clerk and database
- [x] Created Clerk webhook handler (`src/app/api/webhook/clerk/route.ts`)
- [x] Created auth helpers (`src/lib/authHelpers.ts`) - `requireAuth()`, `getCurrentUserId()`

### Phase 4: Service Updates
- [x] Updated settings service (`src/lib/settings.ts`) - per-user settings with `userId` parameter
- [x] Updated Haikubox service (`src/lib/haikubox.ts`) - added `userId` to all functions

### Phase 5: API Routes (Partial)
- [x] Updated 1 of 23 routes: `/api/upload/browser` - now requires auth and associates photos with user

---

## What's Left to Do 🔄

### Remaining API Routes to Update (22 routes)

Each route needs:
1. Import `requireAuth` and `isErrorResponse` from `@/lib/authHelpers`
2. Add authentication check at the start
3. Add `userId` filter to all database queries

#### Photo APIs (5 routes)
- [ ] `src/app/api/photos/route.ts` (GET) - Filter photos by userId
- [ ] `src/app/api/photos/[id]/route.ts` (GET, PATCH, DELETE) - Check userId ownership
- [ ] `src/app/api/photos/unassigned/route.ts` (GET) - Filter by userId

#### Species APIs (5 routes)
- [ ] `src/app/api/species/route.ts` (GET, POST) - Filter/insert with userId
- [ ] `src/app/api/species/[id]/route.ts` (GET, PATCH) - Check ownership
- [ ] `src/app/api/species/refresh/route.ts` (POST) - Add userId

#### Settings API (1 route)
- [ ] `src/app/api/settings/route.ts` (GET, POST) - Pass userId to getSetting/setSetting

#### Haikubox APIs (6 routes)
- [ ] `src/app/api/haikubox/test/route.ts` - Pass userId to getHaikuboxSerial
- [ ] `src/app/api/haikubox/sync/route.ts` - Pass userId, filter detections
- [ ] `src/app/api/haikubox/stats/route.ts` - Pass userId to fetch functions
- [ ] `src/app/api/haikubox/detections/route.ts` (GET) - Filter by userId
- [ ] `src/app/api/haikubox/detections/link/route.ts` (POST) - Filter by userId

#### Activity APIs (3 routes)
- [ ] `src/app/api/activity/current/route.ts` (GET) - Filter by userId
- [ ] `src/app/api/activity/heatmap/route.ts` (GET) - Filter by userId
- [ ] `src/app/api/activity/species/[name]/route.ts` (GET) - Filter by userId

#### Other APIs (2 routes)
- [ ] `src/app/api/suggestions/route.ts` (GET) - Filter species by userId
- [ ] `src/app/api/birds/lookup/route.ts` (GET) - Can remain public or add auth

### Data Migration
- [ ] Create migration script (`scripts/migrate-to-multi-user.ts`)
- [ ] Test migration with first user signup
- [ ] Run migration to assign existing data to first user

### Final Steps
- [ ] Set up Clerk webhook in Clerk Dashboard
- [ ] Update schema to make userId required (remove nullable)
- [ ] Run full test suite
- [ ] Manual testing with 2 accounts
- [ ] Deploy to Railway

---

## API Route Update Pattern

Here's the pattern to follow for each API route:

```typescript
// Add imports at top
import { requireAuth, isErrorResponse } from '@/lib/authHelpers';

// At start of handler function (after rate limiting if present)
export async function GET/POST/PATCH/DELETE(request: NextRequest) {
  // ... rate limiting code if present ...

  // Add authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  // In database queries, add userId filter
  const data = await db
    .select()
    .from(photos)
    .where(eq(photos.userId, userId));  // ← ADD THIS

  // For INSERT operations, include userId
  await db.insert(photos).values({
    userId,  // ← ADD THIS
    // ... other fields
  });
}
```

**For services that call Haikubox/Settings:**
```typescript
// Old
const serial = await getHaikuboxSerial();
const data = await fetchYearlyDetections(year);
const setting = await getSetting("key");

// New
const serial = await getHaikuboxSerial(userId);
const data = await fetchYearlyDetections(userId, year);
const setting = await getSetting(userId, "key");
```

---

## Files Modified This Session

### New Files (7)
1. `src/middleware.ts` - Route protection
2. `src/app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
3. `src/app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page
4. `src/app/api/webhook/clerk/route.ts` - User sync webhook
5. `src/lib/authHelpers.ts` - Auth utilities
6. `src/lib/user.ts` - User management
7. (Pending) `scripts/migrate-to-multi-user.ts` - Data migration

### Modified Files (6)
1. `src/db/schema.ts` - Added users table + userId to all tables
2. `src/app/layout.tsx` - Wrapped with ClerkProvider
3. `src/components/layout/Header.tsx` - Added UserButton
4. `src/lib/settings.ts` - Added userId parameter to all functions
5. `src/lib/haikubox.ts` - Added userId parameter to all functions
6. `src/app/api/upload/browser/route.ts` - Added auth + userId

### Environment Configuration
- `.env.local` - Added Clerk variables (needs actual keys filled in)

---

## Current Database State

**Schema Status**:
- ✅ `users` table created
- ✅ All tables have `userId` field (nullable)
- ⚠️ Existing data has `userId = null` (will be updated during migration)

**Migration Strategy**:
1. Keep userId nullable during development
2. First user signs up → creates user in database
3. Run migration script to assign all existing data to that user
4. After migration, make userId required in schema
5. Push final schema update

---

## Testing Checklist (For Next Session)

### Authentication Flow
- [ ] Visit `http://localhost:3000` → should redirect to `/sign-in`
- [ ] Sign up with test account → should create user in database
- [ ] Sign in → should redirect to Feed page
- [ ] User button in header works
- [ ] Sign out → redirects to sign-in

### API Protection
- [ ] Try accessing API without auth → should return 401
- [ ] Upload photo while authenticated → should work and associate with user

### Data Isolation (After all routes updated)
- [ ] Create Account A and Account B
- [ ] Upload photos in both
- [ ] Verify Account A can't see Account B's photos
- [ ] Verify species, settings, Haikubox data are isolated

---

## Next Session Action Items

1. **Finish API Route Updates** (22 routes remaining)
   - Can be done systematically, one at a time
   - Or create a script to batch update similar routes

2. **Create Migration Script**
   - `scripts/migrate-to-multi-user.ts`
   - Assigns all existing data to first user

3. **Set Up Clerk Webhook**
   - In Clerk Dashboard: Webhooks → Add endpoint
   - URL: `http://localhost:3000/api/webhook/clerk` (for testing)
   - Subscribe to: user.created, user.updated, user.deleted
   - Copy webhook secret to `.env.local`

4. **Test Everything**
   - Sign up, upload photos, create species
   - Create second account, verify isolation
   - Run test suite: `npm test`

5. **Deploy**
   - Add Clerk keys to Railway
   - Set up production webhook URL
   - Run migration in production

---

## Known Issues / Notes

- **Settings.ts revert**: The linter reverted our changes to `settings.ts`. Need to re-apply the userId parameter updates in next session.
- **Haikubox.ts revert**: Same issue - need to re-apply userId parameter to fetch functions.
- **Schema nullable fields**: userId is currently nullable to allow safe migration. Will make required after data migration.
- **API key auth**: The `/api/upload` route (for iOS Shortcuts) is unchanged - keeps API key auth for backward compatibility.

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Push schema changes
npm run db:push

# Run migration script (after creating it)
npx tsx scripts/migrate-to-multi-user.ts your-email@example.com

# Run tests
npm test

# Type check
npm run type-check

# Build
npm run build
```

---

## Questions for Next Session

1. Should we keep the API key auth for iOS Shortcuts, or migrate to Clerk tokens?
2. Do you want email verification required for sign-ups?
3. Should the bird lookup API (`/api/birds/lookup`) remain public or require auth?
4. Any custom fields you want on the user profile?

---

## Reference Links

- [Clerk Next.js Docs](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Webhooks Guide](https://clerk.com/docs/integrations/webhooks)
- [Implementation Plan](/.claude/plans/logical-jingling-sky.md)
