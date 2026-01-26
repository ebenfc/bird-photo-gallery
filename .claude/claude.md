# Bird Photo Gallery - Project Context

## Project Overview

A Next.js 15 application for managing bird photography with Haikubox audio detection integration. The app allows users to catalog bird photos, track species, and correlate visual sightings with audio detections from a Haikubox device.

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript
- PostgreSQL (Supabase)
- Drizzle ORM
- Tailwind CSS
- Clerk Authentication (recently integrated)

---

## Current Status: Clerk Integration

**Completion**: 95% ✅
**Date**: January 25, 2026
**Status**: Code complete - ready for database push and testing

### What's Complete ✅

1. **Database Schema**
   - Users table created with Clerk integration
   - All tables updated with nullable userId columns:
     - photos, species, appSettings
     - haikuboxDetections, haikuboxActivityLog, haikuboxSyncLog

2. **Authentication Infrastructure**
   - Middleware protecting all routes except sign-in/sign-up
   - Clerk Provider in root layout
   - Sign-in and sign-up pages
   - Webhook handler for user sync
   - Auth helper functions (requireAuth, isErrorResponse)

3. **Service Layer Updates**
   - `src/lib/settings.ts` - userId parameter added to all functions
   - `src/lib/haikubox.ts` - userId parameter added to all functions
   - `src/lib/activity.ts` - userId filtering in all queries
   - `src/lib/suggestions.ts` - userId filtering in suggestions

4. **API Routes Protected (20+ routes)**
   - Photos API (3 routes)
   - Species API (3 routes)
   - Settings API (1 route)
   - Haikubox API (5 routes)
   - Activity API (3 routes)
   - Suggestions API (1 route)
   - Upload API (1 route)

5. **Migration Script**
   - `scripts/migrate-to-multi-user.ts` - Assigns existing data to first user

### What's Left ⚠️

1. **Database Push** - Run `npm run db:push` to update database schema
2. **Testing** - Test sign-up, data isolation, and all features
3. **Production Deployment** - Add Clerk keys to Railway, set up webhook

### Key Files for Reference

**Authentication:**
- `src/middleware.ts` - Route protection
- `src/lib/authHelpers.ts` - requireAuth(), isErrorResponse()
- `src/lib/user.ts` - User management functions
- `src/app/api/webhook/clerk/route.ts` - Webhook handler

**Documentation:**
- `CLERK-INTEGRATION-COMPLETE.md` - Step-by-step guide for manual steps
- `CLERK-INTEGRATION-STATUS.md` - Detailed status and changes
- `RESUME-CLERK-INTEGRATION.md` - Original integration plan

---

## Architecture Overview

### Database Schema

**Main Tables:**
- `users` - Clerk users (id, email, firstName, lastName, imageUrl)
- `photos` - Bird photos with metadata
- `species` - Bird species catalog
- `appSettings` - Per-user settings (Haikubox serial, etc.)
- `haikuboxDetections` - Cached Haikubox detection data
- `haikuboxActivityLog` - Hourly activity patterns
- `haikuboxSyncLog` - Sync history tracking

**Relationships:**
- All data tables have `userId` foreign key to `users` table
- Photos belong to species (optional)
- Haikubox detections can be linked to species

### Key Features

1. **Photo Management**
   - Upload from browser or iOS Shortcuts
   - EXIF data extraction
   - Thumbnail generation
   - Species assignment
   - Favorites and notes

2. **Species Catalog**
   - Common and scientific names
   - Rarity classification
   - Wikipedia data enrichment
   - Cover photo selection

3. **Haikubox Integration**
   - Audio detection data sync
   - Species matching
   - Activity pattern analysis
   - Photography suggestions based on detections

4. **Activity Timeline**
   - Hourly activity patterns
   - Heatmap visualization
   - Peak hour identification
   - Current activity predictions

### API Patterns

**Authentication Pattern:**
```typescript
import { requireAuth, isErrorResponse } from '@/lib/authHelpers';

export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) {
    return authResult;
  }
  const { userId } = authResult;

  // Use userId in queries
  const data = await db
    .select()
    .from(table)
    .where(eq(table.userId, userId));
}
```

**Service Layer Pattern:**
```typescript
// All service functions now accept userId as first parameter
export async function getSetting(userId: string, key: string) {
  return await db
    .select()
    .from(appSettings)
    .where(and(
      eq(appSettings.userId, userId),
      eq(appSettings.key, key)
    ));
}
```

---

## Development Guidelines

### Working with Authentication

1. **Always check auth first** in API routes using `requireAuth()`
2. **Filter by userId** in all database queries
3. **Pass userId** to all service layer functions
4. **Test data isolation** - multiple users should never see each other's data

### Database Migrations

- Use Drizzle Kit for schema changes: `npm run db:push`
- Migration scripts go in `scripts/` directory
- Always test migrations locally before production

### Code Style

- TypeScript strict mode enabled
- Use Drizzle ORM for all database operations
- Follow Next.js App Router conventions
- Keep API routes thin - business logic in services

---

## Common Tasks

### Adding a New Protected API Route

1. Import auth helpers:
```typescript
import { requireAuth, isErrorResponse } from '@/lib/authHelpers';
```

2. Add auth check at start of handler:
```typescript
const authResult = await requireAuth();
if (isErrorResponse(authResult)) return authResult;
const { userId } = authResult;
```

3. Filter queries by userId:
```typescript
.where(eq(table.userId, userId))
```

### Adding a New Service Function

1. Accept userId as first parameter
2. Filter all queries by userId
3. Update TypeScript types if needed

### Testing Multi-User Scenarios

1. Use two different browser sessions (or incognito)
2. Sign up with different emails
3. Upload data in each account
4. Verify complete data isolation

---

## Environment Variables

**Required in `.env.local`:**
```bash
# Database
DATABASE_URL=postgresql://...

# Supabase Storage
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# API Key (iOS Shortcuts)
API_KEY=...

# Haikubox
HAIKUBOX_SERIAL=...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

## Known Issues & Considerations

1. **TypeScript Warnings**
   - userId fields are nullable in schema (for migration)
   - API routes always have userId after auth
   - Warnings are expected and safe to ignore

2. **iOS Shortcuts Upload**
   - Still uses API_KEY authentication
   - Not migrated to Clerk (backward compatibility)
   - Consider Clerk API keys for future

3. **Webhook Requirements**
   - Must be publicly accessible
   - Use ngrok for local testing
   - Configure in Clerk Dashboard for production

---

## Next Session Quick Start

When resuming work:

1. **Check current status**: Read `CLERK-INTEGRATION-COMPLETE.md`
2. **If database not pushed yet**: Follow Step 1 in the guide
3. **If testing needed**: Follow Steps 2-5 in the guide
4. **If deploying**: Follow deployment section

### Quick Commands

```bash
# Start development server
npm run dev

# Push database schema
npm run db:push

# Run migration
npx tsx scripts/migrate-to-multi-user.ts YOUR_EMAIL

# Type check
npm run type-check

# Build
npm run build
```

---

## Important Conventions

1. **Never commit**:
   - `.env.local` file
   - Database credentials
   - Clerk secrets

2. **Always**:
   - Filter queries by userId
   - Check authentication in API routes
   - Test with multiple users
   - Update documentation when changing architecture

3. **Code Organization**:
   - `/src/app` - Pages and API routes
   - `/src/lib` - Shared utilities and services
   - `/src/components` - React components
   - `/src/db` - Database schema and connection
   - `/scripts` - One-off scripts and migrations

---

## Deployment Notes

**Railway Configuration:**
- Auto-deploys from GitHub main branch
- Environment variables configured in Railway dashboard
- Database URL points to Supabase PostgreSQL
- Build command: `npm run build`
- Start command: `npm start`

**Production Checklist:**
- [ ] Clerk keys added to Railway
- [ ] Webhook URL configured in Clerk
- [ ] Database schema pushed
- [ ] Migration run (if existing data)
- [ ] Multi-user testing complete
- [ ] All features tested in production

---

## Resources

- **Clerk Documentation**: https://clerk.com/docs/quickstarts/nextjs
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview
- **Next.js App Router**: https://nextjs.org/docs/app
- **Supabase**: https://supabase.com/docs

---

**Last Updated**: January 25, 2026
**By**: Claude Code Assistant
**Status**: Ready for manual database push and testing
