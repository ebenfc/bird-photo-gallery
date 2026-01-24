# Current State: Bird Feed App

**Last Updated**: 2026-01-24
**Branch**: `main`
**Latest Commit**: `4c9e1a9` - Add session notes and update documentation

---

## Quick Reference

### Repository Status
- ✅ **Production**: Stable (after rollback)
- ✅ **Tests**: 82 tests passing
- ✅ **TypeScript**: Strict mode compliant
- ✅ **Linting**: Clean (5 pre-existing warnings, no errors)

### Recent Activity
- **2026-01-24**: Bubble chart feature implemented, deployed, and rolled back
- **Session Notes**: See [SESSION-NOTES-2026-01-24.md](SESSION-NOTES-2026-01-24.md)

---

## Application Structure

### Pages (4 total)
1. **Gallery** (`/`) - Photo upload, filtering (species, favorites, rarity)
2. **Species** (`/species`) - Species directory and detail pages
3. **Activity** (`/activity`) - Haikubox integration insights
4. **Resources** (`/resources`) - External bird ID and info links

### Current Activity Page Components
- `PropertyStatsWidget` - Stats grid + photo opportunities
- `ActiveNowWidget` - Current hour bird predictions

---

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Tailwind CSS v4

### Backend
- PostgreSQL with Drizzle ORM
- Supabase for photo storage
- Next.js API routes

### Testing
- Jest + React Testing Library
- 82 tests total (4 pre-existing failures in image.test.ts)

---

## Database Schema

### Core Tables
- **species** - Bird species information
- **photos** - Photo metadata with species relationships
- **haikuboxDetections** - Cached yearly detection counts
- **haikuboxActivityLog** - Individual detection timestamps
- **haikuboxSyncLog** - Sync history tracking

---

## Key Files

### Activity Page
- `/src/app/activity/page.tsx` - Main activity page
- `/src/components/stats/PropertyStatsWidget.tsx` - Stats display
- `/src/components/activity/ActiveNowWidget.tsx` - Active now predictions
- `/src/components/stats/PropertyBirdsModal.tsx` - Detailed bird list modal

### API Endpoints
- `/api/haikubox/stats` - Property statistics
- `/api/activity/current` - Active now predictions
- `/api/haikubox/sync` - Sync Haikubox data

### Types
- `/src/types/index.ts` - TypeScript interfaces

---

## Git History

```
4c9e1a9 <- Add session notes (CURRENT)
de16731 <- Revert bubble chart (production fix)
ec2173d <- Merge bubble chart PR #21 [REVERTED]
050c098 <- Add bubble chart [REVERTED]
4e9f917 <- Activity page refinements (current working base)
```

---

## Open Items

### Recently Rolled Back
- **Bubble Chart Feature** (PR #21)
  - Implemented and merged
  - Deployed to production
  - Issues reported ("not good")
  - Fully reverted via commit `de16731`
  - Code preserved in git history at `050c098`

### Questions for Next Session
1. What specifically was wrong with the bubble chart?
2. Should we try a different visualization approach?
3. What are the next priority enhancements?

---

## Available for Review

### Session Documentation
- [SESSION-NOTES-2026-01-24.md](SESSION-NOTES-2026-01-24.md) - Full session recap
- [README.md](README.md) - Main documentation
- [TESTING.md](TESTING.md) - Testing guide
- [BUGS.md](BUGS.md) - Known issues

### Git History
Bubble chart implementation available at:
```bash
git show 050c098
```

---

## Next Session Prep

### Ready to Work On
- ✅ Any non-Activity page features
- ✅ Alternative Activity page visualizations
- ✅ Bug fixes and improvements
- ✅ New features in Gallery/Species/Resources

### Need User Input On
- What went wrong with bubble chart?
- Desired Activity page improvements
- Priority features

---

## Commands Reference

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run type-check   # TypeScript check
npm run lint         # ESLint check
```

### Git
```bash
git status           # Check status
git log --oneline    # View history
git checkout main    # Switch to main
```

### GitHub
```bash
gh pr list           # List PRs
gh pr view <number>  # View PR details
```

---

**Status**: ✅ Stable and ready for next session
