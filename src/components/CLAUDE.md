# Components

Components are organized by feature area.

## Directory Structure

| Folder | Purpose |
|--------|---------|
| `activity/` | Haikubox activity page components |
| `agreement/` | User agreement acceptance (AgreementText, AgreementForm) |
| `discover/` | Discover page: BookmarkButton, GalleryCard, DiscoverFilters |
| `gallery/` | Photo gallery and modal components |
| `landing/` | Public landing page (includes `ThemeShowcase` live skin picker) |
| `layout/` | Header, navigation, PublicHeader |
| `providers/` | Theme provider (next-themes wrapper) |
| `settings/` | Settings forms (public gallery, location, appearance/skin picker) |
| `species/` | Species cards and forms |
| `stats/` | Property stats widget |
| `suggestions/` | AI suggestion components |
| `support/` | Issue reporting (ReportIssueButton, ReportIssueModal) |
| `ui/` | Reusable UI primitives (Modal, Button, Input, Select, Toast, RarityBadge, HeardBadge) |
| `upload/` | Photo upload components |

`SentryUserIdentifier.tsx` (root) — Links Clerk user to Sentry context

## Activity Components (`activity/`)

| Component | Purpose |
|-----------|---------|
| `SyncStatusBar` | Shows last sync time + "Sync Now" button with cooldown |
| `SpeciesActivityList` | Filterable/sortable list of detected species |
| `SpeciesActivityRow` | Individual species row with detection count, rarity, photo status |
| `SpeciesActivityFilters` | Rarity and photo status filter controls |
| `UnassignedSpeciesModal` | Modal for creating a species entry from an unmatched detection |
| `ActiveNowWidget` | Real-time activity display |
| `ActivityTimeline` | Timeline view of detections |

## Key Component Patterns

### Collapsible Filters
Mobile views use collapsible filter panels (Feed, Species, Activity, Public Feed). Desktop filters always visible.

### SpeciesCard (`species/SpeciesCard.tsx`)
Shared card for auth and public views. `linkPrefix` prop for URL target, `onEdit` for auth-only edit button. `HeardBadge` only shows with Haikubox data. Photo count shows `"X of 8"` or `"Curated"` badge.

### SwapPicker (`species/SwapPicker.tsx`)
4-column thumbnail grid for photo swaps (used in UploadModal and SpeciesAssignModal). Shows favorite indicator + warning.

### SpeciesForm (`species/SpeciesForm.tsx`)
Create/edit modal with Wikipedia auto-lookup (debounced 800ms). Parent handles the API call via `onSubmit`.

### Photo Modal (`gallery/PhotoModal.tsx`)
- `defaultToFullscreen` — opens directly in fullscreen (Species detail page)
- `readOnly` — hides edit controls (public gallery)
- `adjacentPhotos` — prev/next URLs for peek effect during swipe
- Swipe gestures via `useSwipeGesture`: 1:1 tracking, velocity flicks, elastic bounce, swipe-down dismiss

### Public Header (`layout/PublicHeader.tsx`)
Minimal header for public galleries: Feed/Species tabs, no auth UI, CTA link (desktop only), `children` prop for BookmarkButton.

## Discover Components (`discover/`)

| Component | Purpose |
|-----------|---------|
| `BookmarkButton` | Bookmark toggle on public gallery pages. Uses `useAuth()` — only renders for authenticated users viewing someone else's gallery. |
| `GalleryCard` | Card for gallery listings in Discover directory. Shows display name, location, species/photo counts. Links to `/u/[username]`. |
| `DiscoverFilters` | State dropdown + A-Z/Random sort toggle for browsing the gallery directory. |

## UI Components (`ui/`)

Reusable primitives: buttons, inputs, modals, badges, loading states, toast notifications.
Use these instead of creating one-off styled elements.

### Accessibility Patterns (WCAG 2.1 AA)
- **Modal** has built-in focus trap (Tab/Shift+Tab cycling), focus restore on close, `role="dialog"`, `aria-modal="true"`. Pass `aria-label` or `aria-labelledby` prop to every Modal usage.
- **Input & Select** auto-generate stable IDs via `useId()`, wire `htmlFor` labels, and link errors with `aria-describedby` + `aria-invalid` + `role="alert"`.
- **Button `sm` size** is 44px min-height (WCAG touch target minimum).
- Custom modals (PhotoModal, SpeciesAssignModal, UploadModal) have their own `role="dialog"` + `aria-modal` — not using the shared Modal component.
- Toggle/filter buttons use `aria-pressed`; mobile filter toggles use `aria-expanded` + `aria-label` with active count.
- Decorative SVGs get `aria-hidden="true"`; icon-only buttons get `aria-label`.

### Toast Notifications (`ui/Toast.tsx`)
- `ToastProvider` wraps the app in `layout.tsx` (authenticated section only)
- `useToast()` hook returns `{ showToast(message, type) }`
- Types: `"success"`, `"error"`, `"info"` (default)
- Auto-dismisses after 4 seconds; uses `aria-live="polite"` for screen readers
