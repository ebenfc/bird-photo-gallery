# Bird Photo Gallery

Personal bird photography management app with Haikubox device integration for automatic species detection.

**Repository:** https://github.com/ebenfc/bird-photo-gallery

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL + Drizzle ORM |
| Storage | Supabase |
| Auth | Clerk (`@clerk/nextjs`) |
| Monitoring | Sentry (`@sentry/nextjs`) |
| Validation | Zod |
| Testing | Jest + React Testing Library |

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm test             # All tests
npm run db:push      # Push schema to database
```

## Project Structure

```
src/
  app/              # Pages and API routes (see api/CLAUDE.md)
  components/       # React components (see components/CLAUDE.md)
  db/               # Database schema (see db/CLAUDE.md)
  hooks/            # Custom React hooks (useInfiniteScroll, useKonamiCode, useLogoTapUnlock, usePinchZoom, useScrollLock, useSwipeGesture)
  lib/              # Utilities and business logic (see lib/CLAUDE.md)
  types/            # TypeScript definitions
  config/           # App configuration (limits.ts, usStates.ts)
```

## Deployment

- **Production:** Railway (auto-deploys from `main`) at birdfeed.io
- **Database:** Railway PostgreSQL (production) / Supabase PostgreSQL (local dev)
- **Storage:** Supabase
- **Previews:** Vercel (auto-deploys on PRs)
- **Cron:** Haikubox sync daily at 6am UTC (Vercel)
- **MCP Servers** (all in `~/.claude.json`): Railway (deploy/logs/variables), GitHub (issues/PRs), Sentry (error tracking, org: `birdfeed-a6`), Vercel (deployments/previews, team: `team_xv5NW24dJANhDhJb6zpDE8Tj`), Supabase (DB/storage management)

## Theming System

Two-dimensional theming via HTML attributes on `<html>`:
- `data-mode` — `light` | `dark` | `system` (managed by `next-themes`)
- `data-skin` — `default` | `bold` | `retro` | `coastal` | `journal` | `meadow` | `highcontrast` (managed by `SkinContext`)

6 standard skins + Retro (hidden easter egg). All colors use CSS custom properties; skin overrides in `globals.css` remap every variable. See `src/contexts/CLAUDE.md` for full theming details.

## Public Pages

Public pages (`/u/[username]`, `/about`) are accessible without authentication. Two layers handle this:

1. **Clerk middleware** (`src/proxy.ts`) — marks these routes as public via `isPublicRoute` matcher, so Clerk doesn't require auth
2. **`AuthenticatedLayout`** (`src/components/layout/AuthenticatedLayout.tsx`) — client component using `usePathname()` to skip onboarding gates (agreement form, display name) when authenticated users visit public pages

**Important:** Never use middleware to pass pathname data to server components (e.g., `request.headers.set()`). It interferes with Clerk. Use `usePathname()` in a client component instead.

## Page Metadata

Most pages are client components (`"use client"`), so they can't export `metadata` directly. Pattern:
- Create a `layout.tsx` in the route folder that exports `metadata` (e.g., `src/app/haikubox/layout.tsx`)
- For dynamic routes, use `generateMetadata` in the layout (e.g., `src/app/u/[username]/layout.tsx`)

## Custom Skills (`.claude/skills/`)

Slash commands for common workflows. Invoke with `/skill-name`.

| Skill | Purpose |
|-------|---------|
| `/new-api-route` | Scaffold authenticated API route with auth + validation boilerplate |
| `/migrate` | Safe two-database migration (local Supabase + production Railway) |
| `/new-component` | Generate theme-aware, accessible React component |
| `/theme-var` | Find or create CSS variables across all 7 themes |
| `/pr-ready` | Run tests/lint/type-check, update docs, create PR |
| `/add-public-endpoint` | Scaffold public API route with visibility checks |
| `/update-docs` | Scan changes and update CLAUDE.md files (auto-invocable) |
| `/seed-species` | Generate realistic test fixtures matching DB schema |
| `/design-review` | Evaluate UI for hierarchy, spacing, consistency, theme compliance |
| `/mobile-ux` | Review touch targets, gestures, responsive layout, mobile patterns |
| `/a11y-check` | Audit ARIA, keyboard nav, contrast, screen reader compatibility |

Personal skills (in `~/.claude/skills/`, not committed): `/explain`, `/debug-sentry`, `/check-deploy`

## Key Files

`src/db/schema.ts` (tables) | `src/lib/validation.ts` (Zod schemas) | `src/proxy.ts` (Clerk middleware) | `drizzle.config.ts` (DB config)
