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
  hooks/            # Custom React hooks (useKonamiCode, useLogoTapUnlock)
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

## Theming System

Two-dimensional theming via HTML attributes on `<html>`:
- `data-mode` — `light` | `dark` | `system` (managed by `next-themes`)
- `data-skin` — `default` | `bold` | `retro` (managed by `SkinContext`)

### Available Skins
| Skin | Palette | Status |
|------|---------|--------|
| Default | PNW nature (green/teal) | Active |
| Bold | Purple/electric blue | Active |
| Retro | GeoCities navy/teal/yellow | Unlockable via easter egg |

### How It Works
All colors use CSS custom properties (`var(--forest-500)`, `var(--moss-300)`, etc.). Skin overrides in `globals.css` use `[data-skin="bold"]` / `[data-skin="retro"]` selectors to remap every variable. Components need zero changes — they inherit the active skin automatically.

### Retro Unlock (Easter Egg)
- **Desktop:** Konami Code (↑↑↓↓←→←→BA) — detected by `useKonamiCode` hook
- **Mobile:** 7 rapid taps on the bird logo — detected by `useLogoTapUnlock` hook
- Both triggers live in `Header.tsx` and call `unlockRetro()` from `SkinContext`
- Once unlocked, the Retro card appears in Settings > Appearance

### Color Rules for New Components
- Backgrounds: `var(--card-bg)`, `var(--background)` — never `bg-white`
- Text: `var(--text-primary)`, `var(--text-secondary)` — never hardcoded colors
- Borders: `var(--border)`, `var(--border-light)`
- Accents: `var(--moss-500)`, `var(--forest-600)` — these remap per skin
- Shadows: `var(--shadow-sm)`, `var(--shadow-moss)` — purple-tinted in Bold

### Key Theming Files
- `src/app/globals.css` — CSS variable definitions + skin overrides
- `src/contexts/SkinContext.tsx` — Skin state + localStorage persistence
- `src/components/settings/AppearanceSettings.tsx` — Skin/mode picker UI
- `src/hooks/useKonamiCode.ts` — Konami Code keyboard sequence detector
- `src/hooks/useLogoTapUnlock.ts` — Rapid tap gesture detector

## Page Metadata

Most pages are client components (`"use client"`), so they can't export `metadata` directly. Pattern:
- Create a `layout.tsx` in the route folder that exports `metadata` (e.g., `src/app/activity/layout.tsx`)
- For dynamic routes, use `generateMetadata` in the layout (e.g., `src/app/u/[username]/layout.tsx`)

## Key Files

- `src/db/schema.ts` — All database tables
- `src/lib/validation.ts` — Zod schemas for request validation
- `src/middleware.ts` — Clerk route protection
- `drizzle.config.ts` — Database configuration
