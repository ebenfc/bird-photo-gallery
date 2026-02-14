---
name: pr-ready
description: Run the full pre-PR checklist (tests, lint, type-check, CLAUDE.md updates) and create a pull request. Use when ready to submit work for review.
disable-model-invocation: true
user-invocable: true
argument-hint: [optional PR title]
---

# Pre-PR Checklist & PR Creation

Run the complete quality gauntlet and create a pull request.

## Step 1: Pre-flight checks

Run these in parallel:
```bash
npm test
npm run lint
npm run type-check
```

If ANY check fails, stop and fix the issues before proceeding. Do not create a PR with failing checks.

## Step 2: Verify CLAUDE.md updates

Check if the changes on this branch warrant CLAUDE.md updates:
1. Run `git diff main...HEAD --name-only` to see all changed files
2. If new API routes were added → update `src/app/api/CLAUDE.md` endpoint table
3. If new components were added → update `src/components/CLAUDE.md` directory/component tables
4. If new lib modules were added → update `src/lib/CLAUDE.md` module table
5. If new DB tables/columns were added → update `src/db/CLAUDE.md`
6. If the file structure changed → update the parent `CLAUDE.md`
7. Enforce the 100-line limit per CLAUDE.md file — split if exceeded

## Step 3: Review changes

Show a summary of all commits on this branch:
```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
```

## Step 4: Create the PR

Use the PR template format:
```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
- <bullet points describing changes>

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Documentation
- [ ] Refactoring

## Test Plan
- [ ] <verification steps>

## Screenshots (if UI change)
<!-- Add before/after screenshots if applicable -->
EOF
)"
```

### PR conventions
- Title: under 70 characters, descriptive
- If `$ARGUMENTS` is provided, use it as the PR title
- Branch should already be pushed; if not, push with `git push -u origin HEAD`
- Summary: 2-4 bullet points focusing on "why" not "what"
- Test plan: specific steps to verify the changes work
- Mark the appropriate change type checkbox

## Step 5: Confirm

Show the PR URL so the user can review it.

## Reference

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- CI checks: `.github/workflows/ci.yml` (lint, type-check, build, security scan)
- Git workflow: always create PRs, never push directly to main
