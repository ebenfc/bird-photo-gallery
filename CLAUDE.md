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
- Updated Gallery: Changed "Photo Gallery" to "Gallery"
- Updated Activity: Changed "Haikubox Activity" to "Activity"
- Added consistent descriptive sub-headers across all pages:
  - Gallery: "Browse, upload, and organize your bird photography collection."
  - Species: "Your complete directory of bird species, from common backyard visitors to rare sightings."
  - Activity: "Bird species automatically detected by your Haikubox device on the property."

**Mobile UX:**
- Added swipe gesture support in photo modal (swipe left = next, swipe right = previous)
- Minimum swipe distance of 50px prevents accidental navigation
- Works in both normal and fullscreen modes

**Logo:**
- Updated Bird Feed logo with Dark Eyed Junco-inspired design (path-based SVG)
- Note: Logo may need further refinement to match mockups
