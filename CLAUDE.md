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

## Key Files

- `src/db/schema.ts` — All database tables
- `src/lib/validation.ts` — Zod schemas for request validation
- `src/middleware.ts` — Clerk route protection
- `drizzle.config.ts` — Database configuration
