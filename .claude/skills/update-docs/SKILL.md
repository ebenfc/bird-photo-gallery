---
name: update-docs
description: Scan recent changes and update CLAUDE.md files. Auto-invocable after implementing features.
disable-model-invocation: false
user-invocable: true
context: fork
agent: Explore
---

# CLAUDE.md Maintenance

Scan recent codebase changes and update CLAUDE.md documentation files.

## Step 1: Identify what changed

Check recent changes on the current branch:
```bash
git diff main...HEAD --name-only
```

If no branch diff available, check the last commit:
```bash
git diff HEAD~1 --name-only
```

## Step 2: Map changes to CLAUDE.md files

| Changed files in... | Update this CLAUDE.md |
|---------------------|----------------------|
| `src/app/api/` (new routes) | `src/app/api/CLAUDE.md` endpoint table |
| `src/app/api/public/` | `src/app/api/public/CLAUDE.md` endpoint table |
| `src/components/` (new components) | `src/components/CLAUDE.md` directory/component tables |
| `src/lib/` (new modules) | `src/lib/CLAUDE.md` module table |
| `src/db/schema.ts` | `src/db/CLAUDE.md` tables/columns/indexes |
| `src/app/u/` | `src/app/u/CLAUDE.md` |
| Project structure changes | `CLAUDE.md` (root) |
| New CLAUDE.md files added | `CLAUDE.md` (root) file structure listing |

## Step 3: For each affected CLAUDE.md

1. **Read the current file** and understand its structure
2. **Add new entries** — 2-3 lines max per addition
3. **Remove stale references** — delete entries for files/features that no longer exist
4. **Check the line count** — if over 100 lines, split into a child CLAUDE.md
5. **No duplication** — shared info stays in the parent, directory-specific info in the child

## Rules

- **No changelog content** — no PR descriptions, feature announcements, or debug narratives
- **No personal data** — no user IDs, emails, API keys
- **Only content that helps write future code** — conventions, patterns, gotchas
- **Keep it concise** — if it takes more than 3 lines to explain, it's too detailed for CLAUDE.md

## CLAUDE.md File Structure

```
CLAUDE.md                              (root — project overview, key files)
bird-photo-gallery/CLAUDE.md           (tech stack, commands, deployment)
  src/app/api/CLAUDE.md                (API route patterns)
  src/app/api/public/CLAUDE.md         (public gallery API)
  src/app/u/CLAUDE.md                  (public profile routes)
  src/components/CLAUDE.md             (component patterns)
  src/db/CLAUDE.md                     (database schema)
  src/lib/CLAUDE.md                    (utility modules)
```

If a new directory accumulates its own conventions, create a child CLAUDE.md and add it to this listing.
