---
name: mobile-ux
description: Review a page or component for mobile UX — touch targets, gestures, responsive layout, and mobile-first patterns. Use when evaluating mobile experience.
user-invocable: true
disable-model-invocation: false
argument-hint: [file-path or page-name]
---

# Mobile UX Review

Review the mobile experience of: `$ARGUMENTS`

Read the component/page code and evaluate it against these mobile-specific criteria.

## 1. Touch Targets

- **Minimum 44px touch target** (WCAG 2.1 AA) — check all buttons, links, icons, toggles
- Button `sm` size in our system already meets this, but custom elements might not
- Check spacing between touch targets — adjacent tappable elements need at least 8px gap to prevent mis-taps
- Icon-only buttons are especially prone to being too small

```typescript
// Look for patterns like this — likely too small:
<button className="p-1">  // Only 4px padding — target probably < 44px
<span onClick={...}>      // Inline click handlers on text — no padding at all

// Should be:
<button className="p-2 min-h-[44px] min-w-[44px]">
```

## 2. Gesture Conflicts

BirdFeed uses custom gestures — check for conflicts:

| Gesture | Component | Source |
|---------|-----------|--------|
| Horizontal swipe | PhotoModal | `useSwipeGesture` hook |
| Pinch-to-zoom | PhotoModal (fullscreen) | `usePinchZoom` hook |
| Swipe-down dismiss | PhotoModal | `useSwipeGesture` |
| Tap (on swipeable) | PhotoModal | `onTap` in `useSwipeGesture` |

**Known pitfall:** `useSwipeGesture` must check `e.target` in `touchstart` — skip tracking when touch lands on interactive elements (buttons, links). Otherwise `onTap` fires before `click`, unmounting the button before the click registers.

- Does the component have buttons inside swipeable areas?
- Does it use `usePinchZoom`? If so, swipe should be disabled when zoomed (`enabled: !zoomState.isZoomed`)
- Are there scroll containers that might fight with swipe gestures?

## 3. Responsive Layout

- **Mobile-first Tailwind** — base classes should be mobile, then `md:` / `lg:` for desktop
- **Collapsible filters** — mobile views should use collapsible filter panels (existing pattern in Feed, Species, Activity, Public Feed). Desktop filters always visible
- **No horizontal overflow** — check for elements that break out of viewport on small screens
- **Stack on mobile, row on desktop** — grids should collapse: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Images scale properly** — no fixed widths that overflow on small screens

```typescript
// Common pattern in BirdFeed:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Collapsible filters pattern:
<div className="md:hidden">  {/* Mobile: collapsible */}
<div className="hidden md:block">  {/* Desktop: always visible */}
```

## 4. Text & Readability

- **Font size minimum 16px** on mobile — prevents iOS zoom on input focus
- **Line length** — long text blocks should have `max-w-prose` or equivalent constraint
- **Truncation** — long species names, display names should truncate rather than wrap awkwardly
- **Input fields** — use `type="text"` with appropriate `inputMode` for mobile keyboards

## 5. Performance Considerations

- **Image loading** — are thumbnails used for lists? (`getThumbnailUrl()` from `src/lib/storage.ts`)
- **Lazy loading** — images below the fold should use `loading="lazy"`
- **List virtualization** — is the list potentially very long? Consider virtual scrolling for 50+ items
- **Touch responsiveness** — avoid heavy re-renders on touch events

## 6. Bottom Navigation & Safe Areas

- **Bottom nav clearance** — content shouldn't be hidden behind the bottom navigation bar
- **iOS safe areas** — check for `env(safe-area-inset-bottom)` on fixed/sticky bottom elements
- **Scroll position** — modals opening shouldn't reset scroll position

## Output Format

For each area, give a **Pass / Warning / Fail** rating with specific findings and fix suggestions.

End with **Top 3 Mobile Fixes** — the changes that would most improve the phone experience.

## Reference Files

- Swipe gesture hook: `src/hooks/useSwipeGesture.ts`
- Pinch zoom hook: `src/hooks/usePinchZoom.ts`
- Component patterns: `src/components/CLAUDE.md` (Accessibility section)
- Photo modal (gesture reference): `src/components/gallery/PhotoModal.tsx`
- Storage helpers (thumbnails): `src/lib/storage.ts`
