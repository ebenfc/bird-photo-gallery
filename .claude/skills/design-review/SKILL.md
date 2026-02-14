---
name: design-review
description: Review a page or component for visual design quality — layout, spacing, hierarchy, consistency, and theme compliance. Use when evaluating or improving UI.
user-invocable: true
disable-model-invocation: false
argument-hint: [file-path or page-name]
---

# Design Review

Review the design of: `$ARGUMENTS`

Read the component/page code and evaluate it against these criteria. For each area, give a brief assessment and specific, actionable suggestions.

## 1. Visual Hierarchy

- **Is there a clear focal point?** The most important element should draw the eye first (larger, bolder, higher contrast)
- **Does the information flow logically?** Primary action → supporting info → secondary actions
- **Are headings and labels properly sized?** h1 > h2 > h3 progression, not just font-size but weight and color too
- **Is there enough contrast between content levels?** Primary text vs secondary text vs muted text

## 2. Spacing & Layout

- **Is spacing consistent?** Check for a coherent spacing scale (Tailwind: `gap-2`, `gap-4`, `gap-6` — not random values)
- **Is there enough breathing room?** Cards, sections, and groups need clear separation
- **Are related items grouped?** Proximity = relationship. Items that belong together should be close
- **Is the grid/flexbox layout clean?** No orphaned items, no awkward wrapping

## 3. Theme Compliance

Reference the BirdFeed theme system (see `src/components/CLAUDE.md` and `src/app/globals.css`):

| Check | Pass criteria |
|-------|--------------|
| No raw Tailwind colors | Never `bg-white`, `text-gray-*`, `text-red-500`, etc. |
| Uses CSS variables | `var(--card-bg)`, `var(--text-primary)`, `var(--border)` |
| Dark mode works | Elements look correct with `data-mode="dark"` |
| Always-dark elements | Header/CTA/overlays use `--header-from/to`, not `--forest-950` |
| No missing vars | Not using `--orange-*`, `--red-*`, `--bg-secondary` (don't exist) |
| Shadows are themed | Uses `var(--shadow-sm)`, `var(--shadow-moss)` |

## 4. Consistency

- **Does it match existing pages?** Compare card styles, button treatments, filter patterns
- **Are similar elements styled the same way?** Lists, cards, modals, empty states
- **Does it use existing UI primitives?** Check `src/components/ui/` — Modal, Button, Input, Select, Toast, RarityBadge, LoadingSpinner
- **Is the typography consistent?** Same font weights and sizes for equivalent content levels

## 5. Empty & Loading States

- **Is there an empty state?** What does the user see when there's no data?
- **Is there a loading state?** Skeleton, spinner, or progressive loading?
- **Are error states handled?** What happens on API failure?

## 6. Interaction Design

- **Are interactive elements obvious?** Buttons look clickable, links look tappable
- **Is there feedback on actions?** Toast notifications, loading indicators, disabled states
- **Are destructive actions protected?** Confirmation dialogs for delete/remove

## Output Format

For each area, use this format:

### [Area Name]
**Rating:** Good / Needs work / Missing
**Assessment:** One sentence on current state
**Suggestions:** Specific changes with code examples if relevant

End with a **Priority Summary** — the top 3 changes that would have the biggest visual impact.

## Reference Files

- Component patterns: `src/components/CLAUDE.md`
- UI primitives: `src/components/ui/`
- Theme variables: `src/app/globals.css`
- Color rules: `bird-photo-gallery/CLAUDE.md` (Color Rules section)
