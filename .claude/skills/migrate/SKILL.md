---
name: migrate
description: Safely push Drizzle schema changes to both local and production databases. Use after modifying src/db/schema.ts.
disable-model-invocation: true
user-invocable: true
argument-hint: [local|production|both]
---

# Safe Two-Database Migration

Push Drizzle schema changes to the database. BirdFeed has **two separate databases** — forgetting to push to production is a common and dangerous mistake.

| Environment | Database | How to connect |
|-------------|----------|----------------|
| Local dev | Supabase PostgreSQL | `DATABASE_URL` from `.env` |
| Production | Railway PostgreSQL | `DATABASE_PUBLIC_URL` from Railway CLI |

## Target: `$ARGUMENTS`

- **`local`** — Push to local Supabase DB only
- **`production`** — Push to production Railway DB only
- **`both`** (default if no argument) — Push to local first, then production

## Steps

### 1. Show the pending schema diff
Before pushing anything, run `npx drizzle-kit push --dry-run` to preview changes. Show the user what will change.

### 2. Push to local database
```bash
# drizzle-kit push uses an interactive TUI — piped stdin doesn't work
# Must use expect to automate the confirmation
expect -c '
  spawn npx drizzle-kit push
  expect {
    "Yes, I want to" { send "Yes, I want to execute all statements\r" }
    "No abort" { send "No abort\r" }
    eof
  }
  interact
'
```

Verify success before proceeding.

### 3. Get the production database URL
```bash
railway variables --service Postgres --json
# Extract DATABASE_PUBLIC_URL (the PUBLIC URL, not the internal Railway URL)
```

**CRITICAL:** Use the PUBLIC database URL. The internal Railway URL is not accessible from your local machine.

### 4. Push to production database
```bash
DATABASE_URL="<railway-public-url>" expect -c '
  spawn npx drizzle-kit push
  expect {
    "Yes, I want to" { send "Yes, I want to execute all statements\r" }
    "No abort" { send "No abort\r" }
    eof
  }
  interact
'
```

### 5. Verify
After both pushes succeed, confirm the schema is consistent:
- Check that no pending changes remain: `npx drizzle-kit push --dry-run`
- If any tables have new columns, verify they appear in both databases

## Safety Rules

- **ALWAYS ask before pushing to production** — show the diff first
- **Push local first** — catch errors before touching production
- **Never put `drizzle-kit push` in `postbuild`** — the interactive TUI hangs CI
- **Supabase RLS** is enabled on all tables but Drizzle (database owner) bypasses it — no code changes needed

## Reference Files

- Schema: `src/db/schema.ts`
- Drizzle config: `drizzle.config.ts`
- Migration runner: `src/db/run-migration.mjs`
