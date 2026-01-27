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

**Status**: 🔧 Pending deployment verification
**Production URL**: https://birdfeed.io
**PR**: https://github.com/ebenfc/bird-photo-gallery/pull/35

### Issue Resolved (January 27, 2026)

**Problem**: API routes returning 404 in production
- Railway logs showed: `Couldn't load fs` and `Couldn't load zlib`

**Root Cause**: Railway was running API routes in Edge runtime by default, which doesn't support Node.js built-in modules like `fs` and `zlib`. The `pg` (PostgreSQL) driver depends on these modules.

**Fix Applied** (PR #35):
- Added `export const runtime = "nodejs"` to all 21 API routes
- This forces Next.js to use Node.js runtime instead of Edge runtime

**Next Steps**:
1. Merge PR #35 to main
2. Wait for Railway to auto-deploy
3. Test API endpoints at birdfeed.io:
   - GET /api/health
   - GET /api/photos
   - GET /api/species
   - POST /api/species (create new species)

### Deployment Status

**Railway**: ✅ Live at birdfeed.io
- Custom domain configured with SSL certificate
- CNAME points to `cjnyqfkl.up.railway.app`

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
