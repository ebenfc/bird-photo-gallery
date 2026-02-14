---
name: a11y-check
description: Audit a page or component for accessibility — ARIA attributes, contrast, keyboard navigation, focus management, and screen reader compatibility. Use when checking or improving accessibility.
user-invocable: true
disable-model-invocation: false
argument-hint: [file-path or page-name]
---

# Accessibility Audit

Audit the accessibility of: `$ARGUMENTS`

Read the component/page code and evaluate against WCAG 2.1 AA standards. BirdFeed already has established a11y patterns — check compliance with those.

## 1. ARIA Attributes

### Modals & Dialogs
- Must have: `role="dialog"`, `aria-modal="true"`, `aria-label` or `aria-labelledby`
- Custom modals (PhotoModal, SpeciesAssignModal, UploadModal) handle their own ARIA — don't use the shared Modal component
- The shared `Modal` component has built-in focus trap (Tab/Shift+Tab cycling) and focus restore on close

### Form Controls
- `Input` and `Select` from `src/components/ui/` auto-generate stable IDs via `useId()`
- They auto-wire `htmlFor` labels, `aria-describedby` for errors, `aria-invalid` + `role="alert"` for error messages
- **Check:** Are custom inputs (not using the UI primitives) missing these?

### Interactive Elements
- Toggle/filter buttons: need `aria-pressed`
- Expandable sections: need `aria-expanded` + `aria-label` with active count
- Icon-only buttons: need `aria-label` describing the action
- Decorative SVGs: need `aria-hidden="true"`

### Live Regions
- Toast notifications use `aria-live="polite"` — verify new notifications follow this pattern
- Dynamic content updates (loading states, error messages) should use `aria-live`

## 2. Keyboard Navigation

### Focus Order
- Is the tab order logical? (left-to-right, top-to-bottom)
- Can all interactive elements be reached with Tab?
- Are skip links provided for long navigation?

### Focus Visibility
- Is the focus ring visible? (no `outline-none` without a replacement)
- Does it work in all themes? (focus styles should use CSS variables)

### Modal Focus
- Does focus move INTO the modal when it opens?
- Is focus TRAPPED inside the modal? (Tab shouldn't escape)
- Does focus RESTORE to the trigger element when modal closes?
- Can the modal be closed with Escape?

### Keyboard Shortcuts
- Can photo navigation work with arrow keys?
- Can modals be dismissed with Escape?
- Are there any mouse-only interactions with no keyboard equivalent?

## 3. Color & Contrast

### Text Contrast (WCAG AA minimums)
- Normal text (< 18px): contrast ratio >= 4.5:1
- Large text (>= 18px bold or >= 24px): contrast ratio >= 3:1
- UI components and graphical objects: contrast ratio >= 3:1

### Theme-Specific Checks
BirdFeed has 7 themes — check the component in at least:
- **Default** (baseline)
- **High Contrast** (should exceed WCAG AAA — 7:1)
- **Coastal** (designed for color-blind accessibility)

### Color Independence
- Is information conveyed by color alone? (must also use text, icons, or patterns)
- Rarity badges (common/uncommon/rare): do they have text labels, not just color?
- Error states: use `--error-text` + icon, not just red color

## 4. Screen Reader Compatibility

### Semantic HTML
- Headings: `h1` > `h2` > `h3` (no skipped levels)
- Lists: `<ul>/<ol>` for groups of items, not just `<div>` with `flex`
- Navigation: `<nav>` with `aria-label`
- Main content: `<main>` landmark
- Buttons vs links: `<button>` for actions, `<a>` for navigation

### Image Accessibility
- Photos: meaningful `alt` text (species name + context)
- Decorative images: `alt=""` or `aria-hidden="true"`
- Thumbnails in lists: `alt` should identify the species

### Dynamic Content
- When content loads asynchronously, is the screen reader notified?
- When items are added/removed from lists, is it announced?
- Are loading states communicated? (`aria-busy="true"` on containers)

## 5. Touch Accessibility

- Minimum 44px touch targets (WCAG 2.5.5)
- Adequate spacing between targets (8px minimum gap)
- No actions that require multi-finger gestures as the ONLY way (pinch-to-zoom must have a button alternative)
- No hover-only interactions (tooltips must be tappable too)

## Output Format

### Summary Table

| Category | Rating | Issues Found |
|----------|--------|-------------|
| ARIA Attributes | Pass/Warn/Fail | count |
| Keyboard Navigation | Pass/Warn/Fail | count |
| Color & Contrast | Pass/Warn/Fail | count |
| Screen Reader | Pass/Warn/Fail | count |
| Touch Accessibility | Pass/Warn/Fail | count |

### Issues (sorted by severity)

For each issue:
- **Severity:** Critical / Major / Minor
- **What:** Description of the problem
- **Where:** File path and line number
- **Fix:** Specific code change
- **WCAG criterion:** Reference (e.g., 1.3.1 Info and Relationships)

### Existing Patterns to Reuse

Reference our UI primitives that already handle accessibility:
- `src/components/ui/Modal.tsx` — Focus trap, restore, dialog role
- `src/components/ui/Input.tsx` — Auto ID, label wiring, error linking
- `src/components/ui/Select.tsx` — Same as Input
- `src/components/ui/Button.tsx` — 44px minimum touch target at `sm` size
- `src/components/ui/Toast.tsx` — `aria-live="polite"`

## Reference Files

- Component a11y patterns: `src/components/CLAUDE.md` (Accessibility Patterns section)
- UI primitives: `src/components/ui/`
- Theme variables: `src/app/globals.css`
