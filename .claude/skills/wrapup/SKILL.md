---
name: wrapup
description: End-of-session audit — verify documentation was updated, fill gaps, update MEMORY.md, and create a continuation prompt. Run this before ending every session.
disable-model-invocation: true
user-invocable: true
argument-hint: [optional: summary of what was worked on]
---

# Session Wrapup

Audit the session's documentation state, fill any gaps, and prepare for the next session.

This skill supersedes `/handoff` — it does the same work but **audits first** instead of blindly overwriting.

## Step 1: Gather session context

Understand what was accomplished:
```bash
git log main..HEAD --oneline 2>/dev/null || git log --oneline -5
git diff main...HEAD --stat 2>/dev/null || git diff HEAD~1 --stat
git branch --show-current
```

If `$ARGUMENTS` was provided, incorporate it into the session summary.

## Step 2: Audit CLAUDE.md updates

Check whether documentation was already updated during this session.

### 2a. Determine which CLAUDE.md files *should* have been updated

Run `git diff main...HEAD --name-only` (or `git diff HEAD~1 --name-only` if on main) and map changed files to their corresponding CLAUDE.md:

| Changed files in... | Should update... |
|---------------------|-----------------|
| `src/app/api/` (new routes) | `src/app/api/CLAUDE.md` |
| `src/app/api/public/` | `src/app/api/public/CLAUDE.md` |
| `src/components/` (new components) | `src/components/CLAUDE.md` |
| `src/lib/` (new modules) | `src/lib/CLAUDE.md` |
| `src/db/schema.ts` | `src/db/CLAUDE.md` |
| `src/app/u/` | `src/app/u/CLAUDE.md` |
| `src/contexts/` | `src/contexts/CLAUDE.md` |
| `.claude/skills/` (new or changed skills) | `bird-photo-gallery/CLAUDE.md` skills table |
| Project structure changes | Root `CLAUDE.md` file structure listing |

### 2b. Check which CLAUDE.md files *were* actually updated

```bash
git diff main...HEAD --name-only | grep -i "claude.md" || echo "NO_CLAUDE_MD_CHANGES"
```

### 2c. Report the audit result

Present a clear report to the user:

```
Documentation Audit:
  [CHECK] src/components/CLAUDE.md — updated (new FooComponent added)
  [CHECK] src/lib/CLAUDE.md — updated (new barHelper documented)
  [MISSING] src/db/CLAUDE.md — new column added to schema but not documented
  [OK] No changes needed for: src/app/api/CLAUDE.md, root CLAUDE.md
```

Use `[CHECK]` for files that were correctly updated, `[MISSING]` for files that should have been updated but were not, and `[OK]` for files where no update was needed.

## Step 3: Fill documentation gaps

For each `[MISSING]` item from the audit:

1. Read the current CLAUDE.md file
2. Read the relevant changed files to understand what was added
3. Add concise entries (2-3 lines max per addition)
4. Remove any stale references found along the way
5. Enforce the 100-line limit — split into child files if exceeded

**Rules for CLAUDE.md content:**
- No changelog content — no PR descriptions, feature announcements, or debug narratives
- No personal data — no user IDs, emails, API keys
- Only content that helps write *future* code — conventions, patterns, gotchas

If there were no `[MISSING]` items, skip this step and tell the user: "All documentation was already up to date."

## Step 4: Update MEMORY.md

Edit `~/.claude/projects/-Users-ebencarey-Documents-Bird-App/memory/MEMORY.md`:

1. **Read the current file** first — understand existing structure and entries
2. **Add what was accomplished** — PRs created/merged, features shipped, bugs fixed (2-3 lines per topic)
3. **Add open issues** — anything that broke, needs follow-up, or was deferred
4. **Remove stale entries** — delete entries that are no longer relevant
5. **Do not duplicate** content that already exists in CLAUDE.md files

## Step 5: Create continuation prompt

Write a continuation prompt and save it to `docs/next-session.md` (overwrite if exists):

```bash
mkdir -p docs
```

Format:
```markdown
# Next Session — [date]

## What was completed
- ...

## What remains
- ...

## Blockers / Environment notes
- ...

## Suggested next steps
1. ...
```

Keep it under 30 lines. If there are no blockers, say so explicitly.

## Step 6: Present summary to user

Show the user a final summary:

```
Session Wrapup Complete:
  Documentation: [N files updated / all up to date]
  MEMORY.md: Updated with [brief description]
  Continuation prompt: Saved to docs/next-session.md
```

## Rules

- Never save files to hidden directories (`.claude/plans/`, etc.)
- Always present the audit report (Step 2c) even if everything is already done — the user should see verification
- If the session had no code changes (docs-only or planning session), say so and skip the CLAUDE.md audit
- This skill supersedes `/handoff` for end-of-session use — `/handoff` still works but `/wrapup` is preferred because it audits first
