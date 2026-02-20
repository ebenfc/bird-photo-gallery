---
name: handoff
description: Prepare session handoff — update MEMORY.md, update CLAUDE.md files, and save a continuation prompt to docs/next-session.md.
disable-model-invocation: true
user-invocable: true
argument-hint: [optional: summary of what was worked on]
---

# Session Handoff

> **Note:** `/wrapup` is the preferred end-of-session skill. It audits documentation first, then fills gaps. Use `/handoff` only if you need to skip the audit and go straight to updating.

Prepare the codebase and documentation for handoff to the next Claude session.

## Step 1: Gather session context

Understand what was accomplished in this session:
```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
git branch --show-current
```

If no branch diff is available (working on main), check the last few commits:
```bash
git log --oneline -5
```

## Step 2: Update MEMORY.md

Edit `~/.claude/projects/-Users-ebencarey-Documents-Bird-App/memory/MEMORY.md` to reflect:
- **What was accomplished** — PRs created/merged, features shipped, bugs fixed
- **Open issues** — anything that broke, needs follow-up, or was deferred
- **Current branch state** — which branch, merged or still open, any uncommitted changes

Keep entries concise (2-3 lines per topic). Remove or update stale entries.

## Step 3: Update CLAUDE.md files

Check if any new patterns or conventions were established during this session:
1. Run `git diff main...HEAD --name-only` to see all changed files
2. If new API routes, components, lib modules, or DB changes were made → update the relevant CLAUDE.md
3. If a new CLAUDE.md file was created → update the File Structure listing in the root CLAUDE.md
4. Enforce the 100-line limit per file

## Step 4: Create continuation prompt

Write a continuation prompt that includes:
- **What was completed** — brief summary of accomplishments
- **What remains** — any unfinished items from the current plan or task
- **Blockers or environment issues** — anything the next session should watch for (failing tests, env vars needed, deployment state)
- **Suggested next steps** — what to work on next, in priority order

If `$ARGUMENTS` was provided, incorporate it into the summary.

## Step 5: Save to docs/next-session.md

Save the continuation prompt to `docs/next-session.md` (overwrite if it exists). This file lives in a visible project directory so the user can find it easily.

```bash
# Ensure the docs directory exists
mkdir -p docs
```

Format the file as:
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

## Rules
- Never save handoff files to hidden directories (`.claude/plans/`, etc.)
- Keep the continuation prompt concise — aim for under 30 lines
- If there are no open issues or blockers, say so explicitly rather than omitting the section
