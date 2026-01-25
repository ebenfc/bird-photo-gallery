# Claude Code Instructions for Bird Photo Gallery

## Project Overview

This is **Bird Photo Gallery** - a personal bird photography management web app with Haikubox device integration for automatic species detection. Built with Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL (Drizzle ORM), and Supabase for photo storage.

**Repository:** https://github.com/ebenfc/bird-photo-gallery

## User Context

The user (Eben) is:
- New to coding and Claude Code
- Working on hobby/side-hustle projects
- Unable to manually correct code issues
- Using VS Code as the primary editor

**This means:**
- Code must work correctly the first time - test thoroughly before presenting
- Explain technical concepts in a detailed but accessible way
- Don't assume familiarity with programming terminology
- When something goes wrong, explain what happened and how it's being fixed

## Workflow Preferences

### Planning First
**Always start in planning mode** for any non-trivial task. This includes:
- New features
- Bug fixes that might affect multiple files
- Refactoring
- Any change that isn't a simple one-line fix

Present the plan, get approval on the approach, then implement.

### During Implementation
Once a plan is approved, proceed without asking for approval on individual steps. However:
- **Do ask** when there are genuine decisions to be made (approach choices, design decisions)
- **Don't ask** for permission to run bash commands, edit files, or execute the plan
- Use good judgment - if something unexpected comes up, pause and discuss

### Pull Requests
**Always create a PR** rather than pushing directly to main. This allows Eben to:
- Review changes in GitHub
- Merge when ready
- Maintain oversight of what's changing

PR descriptions should include:
- Summary of what changed (2-4 bullet points)
- Brief test plan or verification steps
- Link to any related context

### Testing
Run the full test suite (`npm test`) before creating a PR. Fix any failures before presenting the PR for review.

## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL + Drizzle ORM |
| Storage | Supabase |
| Validation | Zod |
| Testing | Jest + React Testing Library |

## Key Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm test             # Run all tests
npm run db:push      # Push schema to database
```

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
│   ├── api/          # Backend endpoints
│   ├── activity/     # Haikubox activity page
│   ├── resources/    # External resources page
│   └── species/      # Species directory
├── components/       # React components
├── db/               # Database schema and connection
├── lib/              # Utilities and business logic
├── types/            # TypeScript definitions
└── config/           # App configuration
```

## Important Files

- `src/db/schema.ts` - Database schema (Drizzle ORM)
- `src/lib/validation.ts` - Zod schemas for all data validation
- `src/lib/auth.ts` - API key authentication
- `drizzle.config.ts` - Database configuration
- `.env.local` - Environment variables (never commit)

## Code Quality Checklist

Before creating a PR, ensure:
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm test` passes
- [ ] Manual testing in browser if UI changed

## Communication Style

When explaining technical concepts:
- Use detailed explanations that help Eben learn
- Define technical terms when first used
- Explain the "why" behind decisions, not just the "what"
- When errors occur, explain what went wrong and the fix

## Git Workflow

1. Create a feature branch from `main`
2. Make changes
3. Run tests
4. Create PR with clear description
5. Eben reviews and merges

**Branch naming:** `feature/description` or `fix/description`

## Environment Variables

Required (defined in `.env.local`):
- `DATABASE_URL` - PostgreSQL connection (Railway)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `API_KEY` - API authentication key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (for authentication)
- `CLERK_SECRET_KEY` - Clerk secret key (for authentication)

Optional:
- `HAIKUBOX_SERIAL` - Haikubox device serial

## Deployment

- **Production:** Railway (auto-deploys from main)
- **Database:** Railway PostgreSQL
- **Storage:** Supabase

## Known Context

- PR #21 (bubble chart) was merged then rolled back due to issues
- 4 pre-existing test failures in `image.test.ts` (documented, not blocking)
- The app is actively used and should remain stable

## Recent Updates (January 2026)

### UI Enhancements (PRs #24, #25, #26)

**Navigation & Links:**
- Added external links to allaboutbirds.org on species detail pages
- Made species count bubble on Gallery page clickable → routes to Species page
- Added "View species" button in photo modal (desktop & mobile) linking to species detail page

**Filtering & Sorting:**
- Simplified Gallery sort options to "Most Recent" and "Oldest First" (removed "Species A-Z" and "Recently Photographed")
- Added rarity filters (Common, Uncommon, Rare) to Species page

**Page Headers:**
- Updated Gallery: Changed "Photo Gallery" to "Gallery" (later renamed to "Feed" in PR #28)
- Updated Activity: Changed "Haikubox Activity" to "Activity"
- Added consistent descriptive sub-headers across all pages:
  - Feed: "Browse, upload, and organize your bird photography collection."
  - Species: "Your complete directory of bird species, from common backyard visitors to rare sightings."
  - Activity: "Bird species automatically detected by your Haikubox device on the property."

**Mobile UX:**
- Added swipe gesture support in photo modal (swipe left = next, swipe right = previous)
- Minimum swipe distance of 50px prevents accidental navigation
- Works in both normal and fullscreen modes

**Logo:**
- Updated Bird Feed logo with Dark Eyed Junco-inspired design (path-based SVG)
- Note: Logo may need further refinement to match mockups

### Haikubox Connection Workflow (January 2026)

**Resources Page Enhancement:**
- Replaced broken external link with functional in-page connection form
- Users can now configure their Haikubox device directly in the app
- Form includes:
  - Serial number input with validation (alphanumeric only)
  - "Test Connection" button to validate device before saving
  - "Save" button (only enabled after successful test)
  - Real-time success/error feedback
  - Auto-loads existing serial on page mount

**New Database:**
- Added `app_settings` table to store global application settings
- Settings stored as key-value pairs
- Created `src/lib/settings.ts` service for database-backed configuration

**New API Endpoints:**
- `POST /api/haikubox/test` - Validates Haikubox serial by testing connection to Haikubox API
- `GET /api/settings` - Retrieves current settings from database
- `POST /api/settings` - Saves Haikubox serial to database

**Backend Integration:**
- Updated `src/lib/haikubox.ts` to read serial from database first
- Falls back to `HAIKUBOX_SERIAL` environment variable for backward compatibility
- All Haikubox API calls (`fetchYearlyDetections`, `fetchDailyDetections`, `fetchRecentDetections`) now use database-stored serial
- No restart needed when changing device configuration

**Key Files:**
- `src/lib/settings.ts` - Settings service
- `src/app/api/haikubox/test/route.ts` - Connection test endpoint
- `src/app/api/settings/route.ts` - Settings management endpoint
- `src/app/resources/page.tsx` - Resources page with connection form
- `src/db/schema.ts` - Database schema with app_settings table

### Unassigned Species Feature (PR #27)

**User-Controlled Rarity Classification:**
- Species rarity (Common/Uncommon/Rare) is now defined by the user, not auto-assigned
- Haikubox detections that don't have a matching Species entry show "Unassigned" instead of defaulting to "Common"
- Visual: Unassigned badge has a dashed border style with plus icon to indicate action needed

**Activity Page Enhancements:**
- Added "Unassigned" filter option to quickly find species needing classification
- Clicking on unassigned species opens a modal to create a new species entry
- Modal pre-fills the common name and auto-looks up the scientific name
- User selects rarity (Common/Uncommon/Rare) and creates the species
- Detections are automatically linked to newly created species

**New Components:**
- `src/components/activity/UnassignedSpeciesModal.tsx` - Modal for creating species from Activity page

**New API Endpoints:**
- `POST /api/haikubox/detections/link` - Links detections to a newly created species by matching common name

**Type Changes:**
- `SpeciesActivityData.rarity` now allows `null` (indicates unassigned)
- `SpeciesActivityFilters.rarity` now includes `"unassigned"` option
- Added `DisplayRarity` type (`Rarity | "unassigned"`) for UI purposes

### Feed Page Updates (PR #28)

**Naming:**
- Renamed "Gallery" to "Feed" throughout the app (navigation menu and page title)
- Page description unchanged: "Browse, upload, and organize your bird photography collection."

**Mobile Filter UX:**
- Filters now hidden by default on mobile to prioritize viewing photos
- Added "Filter" button with collapsible panel
- Filter count badge shows number of active filters
- Filters slide down smoothly when expanded
- Desktop layout unchanged (filters always visible)

**Swipe Navigation Fix:**
- Fixed issue where swiping in fullscreen mode would exit to detail view
- Navigation now preserves current view state:
  - Fullscreen → swipe → stays in fullscreen for next photo
  - Detail view → swipe → stays in detail view for next photo
- Works for swipe gestures, arrow button clicks, and keyboard navigation

**Key Files Modified:**
- `src/components/layout/Header.tsx` - "Gallery" → "Feed" in nav
- `src/app/page.tsx` - Title rename, mobile filter toggle, restructured header
- `src/components/gallery/GalleryFilters.tsx` - Removed mobile-only bottom margin
- `src/components/gallery/PhotoModal.tsx` - Added `isNavigatingRef` and `wasFullscreenRef` to preserve view state

### Mobile UI Enhancements (PR #29)

**Species Page Mobile UX:**
- Added collapsible filter toggle matching Feed page pattern
- Filter button shows active filter count badge
- Rarity filters hidden by default on mobile, expand on tap
- Sub-header hidden on mobile (shows species count instead)
- Replaced "Add Species" button with circular floating action button (FAB) on mobile
- Desktop layout unchanged

**Activity Page Mobile UX:**
- Added collapsible filter toggle matching Feed page pattern
- Filter button shows active filter count badge
- Sub-header hidden on mobile (shows detection count instead)
- Removed "Last Heard" sort options (most recent/oldest)
- Sort dropdown moved into collapsible filter panel on mobile
- Desktop layout unchanged (sort stays outside filters)

**Species Detail Page Mobile UX:**
- Photos displayed in single column with larger 4:3 aspect ratio on mobile
- Favorite heart icon shown directly on photo thumbnails
- Photos default to fullscreen mode when opened on mobile
- Grid layout preserved on desktop

**Resources Page Styling:**
- Updated font colors to match other pages:
  - Headers: `text-[var(--forest-900)]`
  - Descriptions: `text-[var(--mist-600)]`
- Applied consistent styling to section headers, form labels, and link cards
- Added `pnw-texture` class to match page backgrounds

**Note:** Rarity tags and Haikubox activity count bubbles were already implemented on Species directory cards (SpeciesCard component) prior to this PR.

**Key Files Modified:**
- `src/app/species/page.tsx` - Mobile filter toggle, FAB button, responsive header
- `src/app/species/[id]/page.tsx` - Single column photo layout on mobile, fullscreen default
- `src/app/activity/page.tsx` - Mobile filter toggle, responsive header
- `src/app/resources/page.tsx` - Font color consistency fixes
- `src/components/activity/SpeciesActivityFilters.tsx` - Sort in collapsible panel on mobile, removed last-heard options
- `src/components/activity/SpeciesActivityList.tsx` - Pass mobile filter state, report active filters to parent
- `src/components/gallery/PhotoModal.tsx` - Added `defaultToFullscreen` prop
- Test updates for mobile/desktop dual rendering

### Bug Fixes - Species Page Mobile UX (PR #31)

**Species Page Loading Title Flash:**
- Fixed loading skeleton showing "Species Directory" instead of "Species"
- Loading state now matches final heading to prevent visual flash

**Species Detail Page Fullscreen Navigation:**
- Fixed fullscreen exit behavior when `defaultToFullscreen` is true
- Tapping to exit fullscreen now closes modal and returns to scroll position
- Previously navigated to unwanted detail view instead
- Escape key now also closes modal when in fullscreen on Species detail page
- Swipe navigation between photos still works correctly in fullscreen

**Key Files Modified:**
- `src/app/species/page.tsx` - Fixed loading skeleton title
- `src/components/gallery/PhotoModal.tsx` - Fixed fullscreen exit behavior

---

## Multi-User Account Management Implementation (In Progress - January 2026)

### Project Vision

Transforming Bird Feed from a single-user app to a multi-user platform where users can:
- Create their own accounts and manage their bird photo collections
- Optionally share their feeds publicly (private by default)
- Connect to their own or shared Haikubox devices
- Control privacy settings for their content

**Domain:** birdfeed.io (purchased, not yet connected to Railway)

### Key Design Decisions

**Monetization:**
- Free for now, potentially monetize later
- Target: ~100 users initially, but birding is growing with Gen Z

**Haikubox Sharing:**
- Users don't need their own Haikubox device
- Can connect to another user's device with their serial number
- Owners can opt-in to share their device (generate shareable codes)
- Owners can revoke access at any time

**Privacy & Sharing:**
- Feeds are **private by default**
- Users can make feeds public (opt-in)
- Public feeds accessible via URL (e.g., `birdfeed.io/@username`)
- **No public discovery feed** - share by direct link only
- Avoids content moderation issues (tool, not social network)

**Data Migration:**
- Starting fresh - no migration of existing data
- Eben and his wife will re-add their birds manually
- Haikubox API will have all historical detection data

### Technology Stack Additions

| Layer | Technology | Reason |
|-------|------------|--------|
| Authentication | Clerk | Fast implementation, beautiful UI, 10k users free |
| Domain | birdfeed.io | Purchased, ready to connect |
| Multi-tenancy | Shared DB with user_id | Simple, cost-effective, standard approach |

### Implementation Plan Overview

**Phase 1: Domain & Authentication** (IN PROGRESS)
- ✅ Purchase domain: birdfeed.io
- ✅ Install Clerk SDK
- ✅ Create sign-in/sign-up pages
- ⏳ Test authentication flow (blocked: user needs to pull changes locally)
- ⬜ Connect domain to Railway
- ⬜ Configure Clerk production keys

**Phase 2: Database Schema Changes**
- Add `users` table (synced from Clerk)
- Add `user_profiles` table (public settings, display name, bio)
- Add `user_id` columns to existing tables (photos, species, app_settings)
- Add `shared_haikuboxes` table (for cross-user device sharing)
- Migration strategy: fresh start, new production DB

**Phase 3: Route Protection & User Isolation**
- Configure middleware to protect app routes
- Update all API routes to filter by current user
- Ensure user data isolation (security critical)
- Add authentication checks to all endpoints

**Phase 4: Onboarding & Settings**
- Create onboarding flow (username, display name, bio)
- Build settings page (profile, privacy, Haikubox connection)
- Add account management features

**Phase 5: Public Feed Sharing**
- Create public feed view route (`/feeds/[username]`)
- Respect privacy settings (404 if private)
- Read-only view with no edit controls
- Show "This is [Name]'s Bird Feed" header

**Phase 6: Haikubox Sharing (Optional/Beta)**
- Generate shareable device codes
- Connect to shared devices
- Manage access (view/revoke)
- Show "Connected to [Name]'s Haikubox" indicator

### Current Status: Phase 1 - Clerk Authentication

**Branch:** `claude/plan-account-sharing-R5aJO`

**Completed:**
- ✅ Installed `@clerk/nextjs` package (v6.36.10)
- ✅ Created `src/middleware.ts` with `clerkMiddleware()` from `@clerk/nextjs/server`
- ✅ Wrapped app with `<ClerkProvider>` in `src/app/layout.tsx`
- ✅ Created sign-in page: `src/app/sign-in/[[...sign-in]]/page.tsx`
- ✅ Created sign-up page: `src/app/sign-up/[[...sign-up]]/page.tsx`
- ✅ Added Clerk environment variables to `.env.local`
- ✅ Configured Clerk dashboard with Email and Google authentication
- ✅ Committed and pushed to remote branch

**Current State:**
- Clerk is installed and configured in the repository
- Test keys are set up in `.env.local` (not committed to git)
- User needs to pull changes locally to their Mac to test
- Once pulled, user can test sign-up/sign-in flow at `http://localhost:3000/sign-up`

**Next Steps (Resume in VS Code):**
1. Pull changes from `claude/plan-account-sharing-R5aJO` branch to local Mac
2. Run `npm install` to install Clerk package
3. Test sign-up and sign-in pages work correctly
4. Configure middleware to protect specific routes (currently permissive)
5. Move to Phase 2: Database schema changes

**Key Files Created/Modified:**
- `src/middleware.ts` - Route middleware with `clerkMiddleware()`
- `src/app/layout.tsx` - Added `ClerkProvider` wrapper
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page with Clerk UI
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page with Clerk UI
- `.env.local` - Added Clerk API keys (local only, not committed)
- `package.json` - Added `@clerk/nextjs` dependency

### Database Schema Changes (Planned - Phase 2)

**New Tables:**

```typescript
// User table (synced from Clerk)
users {
  id: string (from Clerk)
  email: string
  username: string (unique, for profile URLs like @username)
  created_at: timestamp
}

// Public user profile settings
user_profiles {
  user_id: string (FK to users.id)
  display_name: string (e.g., "Eben's Bird Feed")
  bio: string (optional)
  is_feed_public: boolean (default: false)
  share_haikubox: boolean (default: false)
  created_at: timestamp
}

// Haikubox device sharing
shared_haikuboxes {
  id: uuid
  owner_user_id: string (who owns the device)
  shared_with_user_id: string (who can access it)
  created_at: timestamp
}
```

**Modified Tables (add user_id column):**
- `photos` → add `user_id` (references users.id)
- `species` → add `user_id` (references users.id)
- `app_settings` → add `user_id` (references users.id)

### Privacy & Content Moderation Strategy

**No Discovery Mechanisms:**
- No "Explore" page showing all public feeds
- No "Popular Feeds" section
- No commenting system
- No following/followers
- No user directory

**Share by Link Only:**
- Users get a unique URL (e.g., `birdfeed.io/@ebencarey`)
- They share this link on social media, email, etc.
- Similar to Google Docs sharing model
- Provides a tool, not a social platform

**Benefits:**
- No content moderation burden
- Focus on personal/utility use
- Optional sharing without platform liability
- Can add curated directory later if desired

### Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Domain (birdfeed.io) | $1-2/month | ~$15/year |
| Railway | $5-20/month | Scales with usage |
| Supabase | Free | Up to 1GB storage |
| Clerk | Free | Up to 10k users/month |
| **Total** | **~$6-22/month** | For 100 users |

At 10,000+ users, Clerk costs $25/month per 1,000 additional users (but likely monetizing by then).

### Development Timeline (Estimate)

Total estimated time: **2-3 weeks** (part-time work)

- Phase 1 (Domain + Clerk): 2-3 days ✅ (mostly done)
- Phase 2 (Database changes): 1-2 days
- Phase 3 (Route protection + API updates): 3-4 days
- Phase 4 (Onboarding + Settings): 2-3 days
- Phase 5 (Public feeds): 1-2 days
- Phase 6 (Haikubox sharing): 2-3 days (optional, can be beta)
- Testing: 2-3 days

### Suggested PR Breakdown

1. **PR #1**: Clerk authentication setup ⏳ (in progress)
2. **PR #2**: Database schema changes (users, user_profiles, add user_id columns)
3. **PR #3**: Route protection middleware configuration
4. **PR #4**: Update API routes for user isolation
5. **PR #5**: Onboarding flow for new users
6. **PR #6**: Settings page (profile, privacy, Haikubox)
7. **PR #7**: Public feed view functionality
8. **PR #8**: Haikubox sharing features (optional/beta)

### Important Security Considerations

**User Data Isolation:**
- ALWAYS filter queries by `user_id` in API routes
- Use middleware to verify user owns resource being modified
- Never trust client-side user IDs - always get from `auth()` on server

**Example Pattern:**
```typescript
// Bad - trusts client
const photos = await db.query.photos.findMany({
  where: eq(photos.user_id, request.body.userId) // DANGEROUS
});

// Good - uses server-side auth
const { userId } = await auth();
if (!userId) throw new Error('Unauthorized');
const photos = await db.query.photos.findMany({
  where: eq(photos.user_id, userId)
});
```

### Domain Setup (To Do)

**In Namecheap/Domain Registrar:**
1. Go to Domain Management → DNS Settings
2. Add CNAME record: `www` → `your-app.up.railway.app`
3. Add A record for root domain (Railway will provide IP)

**In Railway:**
1. Project Settings → Add Custom Domain
2. Enter `birdfeed.io`
3. Follow DNS instructions
4. Wait 10-60 minutes for DNS propagation
5. SSL certificate auto-provisions via Let's Encrypt

**In Clerk Dashboard:**
1. Update application URLs to use `birdfeed.io`
2. Add production domain to allowed origins
3. Switch from test keys to live keys in Railway environment variables

### Testing Checklist (Before Launch)

- [ ] Multi-user isolation verified (create 2 accounts, ensure data separation)
- [ ] Sign-up flow works (email verification, Google OAuth)
- [ ] Sign-in flow works
- [ ] Onboarding completes successfully
- [ ] Photo upload works for new users
- [ ] Species creation works
- [ ] Haikubox connection works
- [ ] Public feed URLs work (when feed is public)
- [ ] Privacy toggle works (feed switches between public/private)
- [ ] Mobile responsive on all new pages
- [ ] Existing test suite passes
- [ ] Manual cross-browser testing
