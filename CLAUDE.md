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
│   ├── discover/     # Gallery discovery & bookmarks
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
- `src/config/usStates.ts` - US state codes for location settings
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

### Property Stats Widget Improvements (PR #33)

**Clickable Photographed Count:**
- Made "Photographed" species count clickable, linking to Species page
- Added hover effects (scale, background color, shadow) for better UX
- Provides quick navigation to full species directory

**Layout Redesign:**
- Redesigned widget layout: moved "Property Bird Activity 2026" from prominent header to subtle footer
- Reduced visual weight while retaining year context
- Footer includes small speaker icon and muted colors

**Species Count Fix:**
- Fixed species count discrepancy between Activity page (16) and Gallery/Species (25)
- Root cause: Widget was using `heardAndPhotographed` (species heard this year AND photographed) instead of `totalPhotographed` (all species with photos)
- Now shows accurate total across all pages (Feed, Species, Activity all show 25)
- Also fixed capture rate calculation to use correct numerator

**Key Files Modified:**
- `src/components/stats/PropertyStatsWidget.tsx` - Clickable count, footer redesign, count fix

---

## Clerk Authentication Integration (PR #34 - January 2026)

**Status**: ✅ **RESOLVED** (February 1, 2026)
**Production URL**: https://birdfeed.io

### Issues Resolved (February 1, 2026)

**Root Causes Identified and Fixed:**

1. **Missing Database Tables**
   - The `users` table didn't exist in the Railway PostgreSQL database
   - The `postbuild` script (`drizzle-kit push`) wasn't running during Railway deployments
   - **Fix**: Manually ran `drizzle-kit push` against the production database using `DATABASE_PUBLIC_URL`
   - **Command**: `DATABASE_URL="postgresql://..." npx drizzle-kit push`

2. **Browser Upload Route Missing**
   - The file was incorrectly named `route 2.ts` (with a space) instead of `route.ts`
   - Next.js doesn't recognize files with spaces as valid route handlers
   - **Fix**: Created proper `route.ts` with authentication (`requireAuth()`)

3. **User Not Synced to Database**
   - Clerk webhook fires `user.updated` when editing profile, not `user.created`
   - Users created before the webhook was set up were never added to the database
   - **Fix**: Created a Node.js script to manually insert user records

4. **Duplicate Files with Spaces**
   - Many duplicate files like `route 2.ts`, `route 3.ts`, etc. were accidentally committed
   - These caused TypeScript build failures in Railway
   - **Fix**: Deleted all 36 duplicate files

### Debug Endpoints

- `GET /api/debug/auth` - Check authentication status and user database sync
- `POST /api/debug/setup` - Manually create current user in database

### Database Migration Command

When deploying schema changes, use the PUBLIC URL (not internal):
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST].proxy.rlwy.net:[PORT]/railway" npx drizzle-kit push
```

**Note**: The internal URL (`postgres.railway.internal`) only works from within Railway's network.

### Configuration Already in Place

**next.config.ts**:
```typescript
serverExternalPackages: ['sharp', 'pg']
```

**All API routes have**:
```typescript
export const runtime = "nodejs";
```

### Deployment Status

**Railway**: ✅ Live at birdfeed.io (Production)
- Custom domain configured with SSL certificate
- CNAME points to `cjnyqfkl.up.railway.app`
- Note: `postbuild` script skips DB push during build (internal URL not accessible)

**Vercel**: ✅ Configured for PR previews
- Project: `bird-photo-gallery`
- Preview deployments on PRs
- Cron job: Haikubox sync runs daily at 6am UTC
- Analytics: Page views, visitors, referral sources (`@vercel/analytics`)
- Speed Insights: Core Web Vitals monitoring (`@vercel/speed-insights`)

**Clerk Production**: ✅ Fully configured
- All 5 DNS records verified
- SSL certificates issued
- Production keys configured in Railway
- `CLERK_WEBHOOK_SECRET` - ✅ Configured in Railway

**Clerk Webhook**: ✅ Configured
- Endpoint: `https://birdfeed.io/api/webhook/clerk`
- Events: `user.created`, `user.updated`, `user.deleted`

### User Database Status

**Eben's Account**:
- Clerk ID: `user_38mfWcObdqPy7W50V6nObciMrmB`
- Email: `ebenfc@gmail.com`
- Database record: ✅ Created manually (webhook didn't fire on initial signup)

**Note**: The webhook was set up AFTER Eben signed up, so the user record had to be created manually via script. Future signups should work automatically.

### Architecture

- Clerk packages: `@clerk/nextjs`, `svix`
- Database schema: `users` table, `userId` fields on all tables
- Middleware: protects routes except sign-in/sign-up/webhooks
- Auth helpers: `requireAuth()`, `getCurrentUserId()`
- All API routes updated with authentication

### Key Files

**Authentication**:
- `src/middleware.ts` - Route protection
- `src/lib/authHelpers.ts` - `requireAuth()` helper for API routes
- `src/lib/user.ts` - User database operations
- `src/app/api/webhook/clerk/route.ts` - Webhook handler

**Sign-in/Sign-up**:
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`

### Environment Variables

**Railway** (production):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - ✅ Configured (pk_live_)
- `CLERK_SECRET_KEY` - ✅ Configured (sk_live_)
- `CLERK_WEBHOOK_SECRET` - ✅ Configured

**GitHub Secrets** (for CI):
- `CLERK_PUBLISHABLE_KEY` - ✅ Added
- `CLERK_SECRET_KEY` - ✅ Added

**GitHub Automation**:
- Dependabot: Weekly npm dependency updates (Mondays 9am ET)
- PR Template: `.github/PULL_REQUEST_TEMPLATE.md` for consistent PR descriptions
- Branch protection: Recommended for `main` branch

**Sentry** (error monitoring):
- SDK: `@sentry/nextjs` v10+ with official wizard setup
- DSN hardcoded in config files (not env vars)
- Config files: `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation-client.ts`
- Error boundaries: `src/app/error.tsx`, `src/app/global-error.tsx`
- Session replay: enabled (10% normal, 100% on error)
- Tunnel route: `/monitoring` (bypasses ad blockers)
- Source maps: uploaded via `withSentryConfig` in `next.config.ts`

**Vercel** (preview deployments):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - ✅ Configured
- `CLERK_SECRET_KEY` - ✅ Configured
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - ✅ Configured
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - ✅ Configured
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - ✅ Configured

---

## Account Menu Feature (PR #39 - February 2026)

**Added user account menu to the Header for easy login/logout and account management.**

### Features

**User Avatar Dropdown (when signed in):**
- Displays user avatar in header (right side)
- Clicking opens dropdown with:
  - "Manage account" - Opens Clerk's account portal for profile, password, sessions
  - "Sign out" - Logs out and redirects to home page

**Sign In Link (when signed out):**
- Desktop: "Sign in" link in header navigation
- Mobile: "Sign in" option in mobile menu with login icon

### Implementation

- Uses Clerk's built-in `UserButton` component
- `SignedIn` / `SignedOut` wrappers for conditional rendering
- Responsive design: avatar visible on all screen sizes

### Key File Modified
- `src/components/layout/Header.tsx` - Added UserButton and sign-in links

---

## Public Gallery Sharing Feature (PR #52 - February 2026)

**Enables users to share their bird photo gallery via a public, username-based URL.**

### Overview

Users can create a unique username and share their gallery publicly at `/u/[username]`. Visitors get read-only access to the Feed and Species pages without authentication.

**Production Example:** `https://birdfeed.io/u/yourname`

### User Settings

Located on the Resources page:
- **Username input** - Unique identifier for public URL (3-30 chars, lowercase alphanumeric + hyphens)
- **Public gallery toggle** - Enable/disable public access
- **Copy link button** - Copy public URL to clipboard
- **Privacy tip** - Recommends not using real name or email

### What Visitors Can See (Read-Only)

- Feed page (all photos)
- Species directory
- Species detail pages
- Filter and sort controls work normally

### What Visitors Cannot See

- Activity page (Haikubox detections - location-sensitive)
- Resources page (settings)
- Edit/create/delete functionality
- Favorite toggle
- Haikubox detection data on photos

### Database Fields

Added to `users` table:
- `username` (text, unique, nullable) - Public URL identifier
- `is_public_gallery_enabled` (boolean, default false)

### Key Files

**Settings:**
- `src/components/settings/PublicGallerySettings.tsx` - Username + toggle form
- `src/app/api/settings/profile/route.ts` - GET/PATCH profile settings
- `src/app/api/settings/profile/check-username/route.ts` - Username availability check

**Public Routes:**
- `src/app/u/[username]/` - Public gallery pages (layout, feed, species)
- `src/app/api/public/gallery/[username]/` - Public API endpoints

**Authentication:**
- `src/proxy.ts` - Added `/u/(.*)` and `/api/public/(.*)` to public routes

**Component Changes:**
- `src/components/gallery/PhotoModal.tsx` - Added `readOnly` prop
- `src/components/layout/PublicHeader.tsx` - Minimal header for public pages

### Database Migration

When adding the username columns to production:
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST].proxy.rlwy.net:[PORT]/railway" npm run db:push
```

Select "No, add the constraint without truncating the table" when prompted.

### Documentation

- `src/app/u/CLAUDE.md` - Public profile routes documentation
- `src/app/api/public/CLAUDE.md` - Public API endpoints documentation

---

## Gallery Discovery & Bookmarking Feature (PR #77 - February 2026)

**Non-social gallery discovery: browse public galleries by location and privately bookmark favorites.**

### Design Philosophy

Intentionally non-social — no metrics, popularity sorting, follower counts, or engagement features. Users control their discoverability with a separate `isDirectoryListed` toggle (independent of `isPublicGalleryEnabled`).

### Database Changes

Added to `users` table: `city` (text), `state` (2-letter US code), `isDirectoryListed` (boolean).
New `bookmarks` table: `(userId, bookmarkedUserId)` with unique constraint + cascade deletes.

### Discover Page (`/discover`)

Two tabs:
- **Browse** — Directory of galleries where `isDirectoryListed=true`. Filterable by US state, sortable alphabetically or randomly. Never sorted by popularity.
- **Saved** — Private bookmarks list. Only visible to the authenticated user.

### Bookmarking

- BookmarkButton appears on public gallery pages for authenticated visitors
- Private — no one can see your bookmarks
- Bookmarks API: `POST /api/bookmarks`, `DELETE /api/bookmarks/[username]`, `GET /api/bookmarks`, `GET /api/bookmarks/check/[username]`

### Location Settings

City + US state dropdown on Resources page (`LocationSettings` component). State validated against `src/config/usStates.ts` (50 states + DC).

### Key Files

- `src/app/discover/page.tsx` — Discover page with Browse/Saved tabs
- `src/components/discover/` — BookmarkButton, GalleryCard, DiscoverFilters
- `src/components/settings/LocationSettings.tsx` — City/state settings form
- `src/app/api/bookmarks/` — Bookmarks CRUD endpoints
- `src/app/api/public/discover/route.ts` — Public browse directory endpoint
