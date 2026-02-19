#!/bin/bash
# Pre-commit hook for Claude Code
# Runs tsc + eslint before git commits. Exit 2 = block the commit.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept git commit commands — let everything else through
if [[ ! "$COMMAND" =~ git[[:space:]].*commit ]]; then
  exit 0
fi

# Run checks from the Next.js project directory
cd "$CLAUDE_PROJECT_DIR/bird-photo-gallery" || exit 0

echo "Running type-check..." >&2
if ! npx tsc --noEmit 2>&1; then
  echo "TypeScript errors found. Fix before committing." >&2
  exit 2
fi

echo "Running lint..." >&2
if ! npx eslint . --max-warnings 0 2>&1; then
  echo "Lint errors found. Fix before committing." >&2
  exit 2
fi

exit 0
