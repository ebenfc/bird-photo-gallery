---
name: handoff
description: Prepare a continuation prompt for resuming work in a new session. Use when spanning multiple sessions or approaching context limits.
disable-model-invocation: true
user-invocable: true
argument-hint: [optional: summary or topic focus for next session]
---

# Session Handoff

Prepare documentation and a continuation prompt so work can be cleanly resumed in a new session (via "resume conversation" or a fresh context window).

Use this when:
- You're spanning multiple sessions on the same feature/task
- You're approaching context limits and want to continue in a fresh window
- You want a clean prompt to paste into a new session

## Step 1: Gather session context

Understand what was accomplished and what's in progress:
```bash
git branch --show-current
git log main..HEAD --oneline 2>/dev/null || git log --oneline -5
git status --short
```

If `$ARGUMENTS` was provided, use it to focus the handoff on a specific topic.

## Step 2: Update documentation

Ensure CLAUDE.md files and MEMORY.md reflect the current state before handing off:

1. Run `git diff main...HEAD --name-only` to see all changed files
2. If new patterns, routes, components, schema changes, or skills were introduced — update the relevant CLAUDE.md files
3. Update MEMORY.md with what was accomplished and any open issues
4. Remove or update stale entries

This prevents the next session from working with outdated context.

## Step 3: Create continuation prompt

Write a continuation prompt designed to give the next session full context. Save to `docs/next-session.md` (overwrite if exists):

```bash
mkdir -p docs
```

The prompt should be **self-contained** — assume the next session starts with a fresh context window and only has CLAUDE.md + MEMORY.md for background. Include:

```markdown
# Next Session — [date]

## Context
[1-2 sentences: what feature/task is being worked on and why]

## Current state
- Branch: `feature/...` [merged / open PR #N / in progress]
- Last commit: [hash] [message]
- [Any uncommitted changes or WIP state]

## What was completed
- ...

## What remains
- ...
[Be specific: which files, which functions, which steps in the plan]

## Key decisions made
- [Any architectural or design decisions the next session needs to know]

## Blockers / Watch out for
- [Environment issues, failing tests, known bugs, deployment state]
- [If none, say "No blockers."]

## Suggested next steps
1. ...
```

## Step 4: Present to user

Show the user:
1. The continuation prompt (so they can review it before the session ends)
2. Where it was saved (`docs/next-session.md`)
3. A reminder: "Paste this into your next session or use resume conversation to continue."

## Rules

- Keep the continuation prompt concise — aim for under 40 lines
- Be specific about what remains (file names, function names, plan steps) — vague handoffs lose context
- Never save to hidden directories (`.claude/plans/`, etc.)
- If there are no open issues or blockers, say so explicitly
- Always update CLAUDE.md and MEMORY.md before creating the prompt — the next session reads those first
