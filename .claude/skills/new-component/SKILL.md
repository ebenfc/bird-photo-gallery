---
name: new-component
description: Generate a new React component following BirdFeed patterns (theme-aware, accessible, client component). Use when creating new UI components.
disable-model-invocation: true
user-invocable: true
argument-hint: [ComponentName feature-area]
---

# New Component

Create a new component: `$ARGUMENTS`

Parse the arguments as: first word = ComponentName, second word = feature area directory (e.g., `species`, `gallery`, `settings`, `ui`). If no feature area specified, ask which directory it belongs in.

## Required Structure

### File location
`src/components/{feature-area}/{ComponentName}.tsx`

### Template
```typescript
"use client";

import { /* ... */ } from "react";

interface {ComponentName}Props {
  // Define props
}

export default function {ComponentName}({ /* props */ }: {ComponentName}Props) {
  return (
    // Implementation
  );
}
```

## Mandatory Conventions

### 1. Client component
Almost all BirdFeed components are client components — add `"use client"` at the top. The only exception is `src/app/page.tsx`.

### 2. Theme-aware colors (NEVER use raw Tailwind colors)
```css
/* CORRECT */
background: var(--card-bg)
color: var(--text-primary)
border-color: var(--border)

/* WRONG — breaks theming */
bg-white, text-gray-900, border-gray-200, text-red-500
```

Key variable groups:
- Backgrounds: `--card-bg`, `--background`, `--mist-50` (subtle)
- Text: `--text-primary`, `--text-secondary`
- Borders: `--border`, `--border-light`
- Accents: `--forest-*`, `--moss-*`, `--sky-*`, `--amber-*` (auto-invert in dark mode)
- Status: `--error-text/bg/border`, `--success-text/bg/border`, `--danger-from/to`
- Always-dark elements: `--header-from`, `--header-to` (for header/CTA/overlays)
- No `--orange-*`, `--red-*`, or `--bg-secondary` vars exist

### 3. Accessibility (WCAG 2.1 AA)
- Buttons: 44px minimum touch target (use Button `sm` size or larger)
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-label` or `aria-labelledby`
- Inputs: auto `useId()` for `htmlFor` labels, `aria-describedby` for errors
- Icons: decorative SVGs get `aria-hidden="true"`, icon-only buttons get `aria-label`
- Toggle buttons: `aria-pressed`
- Expandable sections: `aria-expanded` + `aria-label`

### 4. Existing UI primitives
Check `src/components/ui/` before creating custom elements:
- `Modal`, `Button`, `Input`, `Select`, `Toast`, `RarityBadge`, `RarityPicker`, `HeardBadge`, `LoadingSpinner`

### 5. Toast notifications
Use `useToast()` hook for success/error/info feedback:
```typescript
const { showToast } = useToast();
showToast("Species created!", "success");
```

## After Creation

1. Update `src/components/CLAUDE.md` with the new component (add to the appropriate feature area table)
2. If creating a new feature directory, add it to the directory structure table

## Reference Files

- Component patterns: `src/components/CLAUDE.md`
- UI primitives: `src/components/ui/`
- Theme variables: `src/app/globals.css`
- Skin context: `src/contexts/SkinContext.tsx`
