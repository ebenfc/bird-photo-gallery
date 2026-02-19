#!/bin/bash
# Headless Claude Code documentation audit
# Run manually, as a cron job, or as a pre-push git hook.
#
# Usage:
#   bash scripts/audit-docs.sh
#
# Output: docs/audit-report.md

cd "$(dirname "$0")/.." || exit 1

claude -p "Audit all CLAUDE.md and MEMORY.md files for stale references, deleted files, outdated patterns, and version mismatches. Cross-reference file paths mentioned in docs against the actual filesystem. Output a summary of issues found to docs/audit-report.md with sections: Stale References, Missing Files, Outdated Info, and Recommendations." \
  --allowedTools "Read,Grep,Glob,Write"
