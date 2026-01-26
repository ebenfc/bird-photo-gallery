# Quick Start Guide: Resume Clerk Integration

**Previous Session**: January 25, 2026 - 60% Complete
**Full Status**: See [CLERK-INTEGRATION-STATUS.md](./CLERK-INTEGRATION-STATUS.md)

## Immediate Action Items

### 1. Re-apply Service Updates (Linter Reverted Changes)

The linter auto-reverted changes to two files. Re-apply userId parameters:

**File: `src/lib/settings.ts`**
- Change `getSetting(key)` → `getSetting(userId, key)`
- Change `setSetting(key, value)` → `setSetting(userId, key, value)`
- Change `getHaikuboxSerial()` → `getHaikuboxSerial(userId)`
- Add `and()` to imports from drizzle-orm
- Update all queries to filter by userId

**File: `src/lib/haikubox.ts`**
- Change `fetchYearlyDetections(year)` → `fetchYearlyDetections(userId, year)`
- Change `fetchDailyDetections(date)` → `fetchDailyDetections(userId, date)`
- Change `fetchRecentDetections(hours)` → `fetchRecentDetections(userId, hours)`
- Update calls to `getHaikuboxSerial(userId)`

### 2. Update Remaining API Routes (22 routes)

Use this pattern for each route:

```typescript
import { requireAuth, isErrorResponse } from '@/lib/authHelpers';

export async function GET(request: NextRequest) {
  // Add auth check
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  // Filter queries by userId
  const data = await db
    .select()
    .from(tableName)
    .where(eq(tableName.userId, userId));
}
```

**Priority Order:**
1. Photos API (`src/app/api/photos/route.ts`) - Most used
2. Species API (`src/app/api/species/route.ts`) - Core functionality
3. Settings API (`src/app/api/settings/route.ts`) - Critical for Haikubox
4. Haikubox APIs (6 files) - Device integration
5. Activity APIs (3 files) - Dashboard data
6. Others (2 files) - Supporting features

### 3. Create Migration Script

**File: `scripts/migrate-to-multi-user.ts`**

```typescript
import { db } from "../src/db";
import { users, photos, species, appSettings,
         haikuboxDetections, haikuboxActivityLog, haikuboxSyncLog } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function migrateData(userEmail: string) {
  // Find user by email
  const user = await db.select().from(users)
    .where(eq(users.email, userEmail)).limit(1);

  if (!user[0]) {
    console.error('User not found');
    process.exit(1);
  }

  const userId = user[0].id;

  // Update all tables where userId is null
  await db.update(photos).set({ userId }).where(eq(photos.userId, null));
  await db.update(species).set({ userId }).where(eq(species.userId, null));
  await db.update(appSettings).set({ userId }).where(eq(appSettings.userId, null));
  await db.update(haikuboxDetections).set({ userId }).where(eq(haikuboxDetections.userId, null));
  await db.update(haikuboxActivityLog).set({ userId }).where(eq(haikuboxActivityLog.userId, null));
  await db.update(haikuboxSyncLog).set({ userId }).where(eq(haikuboxSyncLog.userId, null));

  console.log('Migration complete!');
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/migrate-to-multi-user.ts <email>');
  process.exit(1);
}

migrateData(email);
```

### 4. Testing Workflow

```bash
# 1. Add your Clerk keys to .env.local (if not done yet)

# 2. Start dev server
npm run dev

# 3. Visit http://localhost:3000 (should redirect to sign-in)

# 4. Sign up with your email

# 5. Check database for user
# You should see a new record in the users table

# 6. Run migration
npx tsx scripts/migrate-to-multi-user.ts your-email@example.com

# 7. Test uploading a photo
# Should work and associate with your user

# 8. Create second test account

# 9. Verify data isolation
# Photos from account 1 shouldn't show in account 2
```

### 5. Set Up Webhook (After Testing Locally)

1. In Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `http://localhost:3000/api/webhook/clerk` (for testing)
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret to `.env.local` as `CLERK_WEBHOOK_SECRET`
5. For production: Change URL to your Railway domain

---

## File Reference

### Routes Needing Updates

```
src/app/api/
├── photos/
│   ├── route.ts (GET) ❌
│   ├── [id]/route.ts (GET, PATCH, DELETE) ❌
│   └── unassigned/route.ts (GET) ❌
├── species/
│   ├── route.ts (GET, POST) ❌
│   ├── [id]/route.ts (GET, PATCH) ❌
│   └── refresh/route.ts (POST) ❌
├── settings/route.ts (GET, POST) ❌
├── haikubox/
│   ├── test/route.ts ❌
│   ├── sync/route.ts ❌
│   ├── stats/route.ts ❌
│   └── detections/
│       ├── route.ts (GET) ❌
│       └── link/route.ts (POST) ❌
├── activity/
│   ├── current/route.ts ❌
│   ├── heatmap/route.ts ❌
│   └── species/[name]/route.ts ❌
├── suggestions/route.ts ❌
├── birds/lookup/route.ts ❌
└── upload/
    └── browser/route.ts ✅ DONE
```

### Completed Files

```
✅ src/middleware.ts
✅ src/app/layout.tsx
✅ src/app/sign-in/[[...sign-in]]/page.tsx
✅ src/app/sign-up/[[...sign-up]]/page.tsx
✅ src/components/layout/Header.tsx
✅ src/lib/user.ts
✅ src/lib/authHelpers.ts
✅ src/app/api/webhook/clerk/route.ts
✅ src/app/api/upload/browser/route.ts
⚠️ src/lib/settings.ts (needs userId params re-applied)
⚠️ src/lib/haikubox.ts (needs userId params re-applied)
✅ src/db/schema.ts (userId nullable for now)
```

---

## Common Issues & Solutions

**Issue**: "User not found" when testing
- **Solution**: Make sure you signed up through the app first, webhook creates the user

**Issue**: TypeScript errors on `userId`
- **Solution**: Schema allows nullable userId, but API routes will always have it after auth

**Issue**: Photos showing null userId
- **Solution**: That's expected before migration. Run migration script after first signup.

**Issue**: Can't access any pages
- **Solution**: Check that Clerk keys are correct in `.env.local` and middleware is not blocking too much

**Issue**: Webhook not working
- **Solution**: For local testing, use ngrok or Clerk's "Test" feature in dashboard

---

## Estimated Time Remaining

- Re-apply service updates: 10 minutes
- Update API routes (22): 1-2 hours (systematic, repetitive)
- Create migration script: 15 minutes
- Testing: 30 minutes
- Deploy: 15 minutes

**Total**: ~3-4 hours of focused work

---

## Success Criteria

- ✅ Can sign up and sign in
- ✅ User button works in header
- ✅ All pages require authentication
- ✅ Photos upload and associate with current user
- ✅ Can't see other users' data
- ✅ Settings/Haikubox config are per-user
- ✅ Migration assigns existing data to first user
- ✅ Tests pass
- ✅ Deploys to Railway successfully
