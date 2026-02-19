# Components

Components are organized by feature area.

## Directory Structure

| Folder | Purpose |
|--------|---------|
| `activity/` | Haikubox activity page components |
| `agreement/` | User agreement acceptance (AgreementText, AgreementForm) |
| `onboarding/` | Post-agreement onboarding gates (DisplayNameGate) |
| `discover/` | Discover page: BookmarkButton, GalleryCard, DiscoverFilters |
| `gallery/` | Photo gallery and modal components |
| `landing/` | Public landing page (includes `ThemeShowcase` live skin picker) |
| `layout/` | Header, navigation, PublicHeader, AuthenticatedLayout |
| `providers/` | Theme provider (next-themes wrapper) |
| `settings/` | Settings forms (public gallery, location, appearance/skin picker) |
| `species/` | Species cards and forms |
| `stats/` | Property stats widget |
| `suggestions/` | AI suggestion components |
| `support/` | Issue reporting (ReportIssueButton, ReportIssueModal) |
| `ui/` | Reusable UI primitives (Modal, Button, Input, Select, Toast, RarityBadge, RarityPicker, HeardBadge) |
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
| `HaikuboxSetupCard` | Guided setup flow for connecting a Haikubox device |

## Key Component Patterns

### Collapsible Filters
Mobile views use collapsible filter panels (Feed, Species, Activity, Public Feed). Desktop filters always visible.

### SpeciesCard (`species/SpeciesCard.tsx`)
Shared card for auth and public views. `linkPrefix` prop for URL target, `onEdit` for auth-only edit button. `HeardBadge` only shows with Haikubox data. Photo count shows `"X of 8"` or `"Curated"` badge. Shows "First photographed" date when `species.firstPhotoDate` is set.

### SwapPicker (`species/SwapPicker.tsx`)
4-column thumbnail grid for photo swaps (used in UploadModal and SpeciesAssignModal). Shows favorite indicator + warning.

### SpeciesForm (`species/SpeciesForm.tsx`)
Create/edit modal with Wikipedia auto-lookup (debounced 800ms). Parent handles the API call via `onSubmit`. eBird and iNaturalist URL fields only appear in edit mode (`initialData` is set), not during creation.

### Photo Modal (`gallery/PhotoModal.tsx`)
- `defaultToFullscreen` — opens directly in fullscreen (Species detail page)
- `readOnly` — hides edit controls (public gallery)
- `adjacentPhotos` — prev/next URLs for peek effect during swipe
- Swipe gestures via `useSwipeGesture`: 1:1 tracking, velocity flicks, elastic bounce, swipe-down dismiss
- **Pinch-to-zoom** (fullscreen only) via `usePinchZoom`: pinch 1x–4x, pan while zoomed, double-tap to toggle 2.5x. Disables swipe when zoomed (`enabled: !zoomState.isZoomed`). `useSwipeGesture` has multi-touch guard to avoid conflicts.
- **Camera Info** — Collapsible section showing EXIF metadata (camera, lens, shooting settings as pill badges). Only renders when `hasExifData` is true (at least one EXIF field non-null). Desktop: card in sidebar. Mobile: expandable section above dates.

### Authenticated Layout (`layout/AuthenticatedLayout.tsx`)
Client component wrapping all authenticated content. Uses `usePathname()` to detect public pages (`/u/`, `/about`) and skip onboarding gates. On public pages: fully onboarded users see app chrome (Header, nav), others see just the page content. On app pages: enforces agreement → display name → full app flow.

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

### RarityPicker (`ui/RarityPicker.tsx`)
Toggle buttons for common/uncommon/rare selection. Props: `value: Rarity`, `onChange: (rarity: Rarity) => void`. Used in SpeciesForm, SpeciesAssignModal, and UnassignedSpeciesModal.

### Accessibility Patterns (WCAG 2.1 AA)
- **Modal** has built-in focus trap (Tab/Shift+Tab cycling), focus restore on close, `role="dialog"`, `aria-modal="true"`. Pass `aria-label` or `aria-labelledby` prop to every Modal usage.
- **Input & Select** auto-generate stable IDs via `useId()`, wire `htmlFor` labels, and link errors with `aria-describedby` + `aria-invalid` + `role="alert"`.
- **Button `sm` size** is 44px min-height (WCAG touch target minimum).
- Custom modals (PhotoModal, SpeciesAssignModal, UploadModal) have their own `role="dialog"` + `aria-modal` — not using the shared Modal component.
- Toggle/filter buttons use `aria-pressed`; mobile filter toggles use `aria-expanded` + `aria-label` with active count.
- Decorative SVGs get `aria-hidden="true"`; icon-only buttons get `aria-label`.

### Dark Mode: Always-Dark Elements
For elements that must stay dark in both light and dark mode (header, CTA, photo overlays, modal backdrops), use `--header-from`/`--header-to` instead of `--forest-950`/`--forest-900`. These vars are defined in all theme blocks and never invert. For text on always-dark backgrounds, use `text-white/80`, `text-white/60`, `border-white/20`.

All 7 themes now fully invert `--forest-*`, `--moss-*`, `--sky-*`, `--amber-*` palettes in dark mode. No `--orange-*`, `--red-*`, or `--yellow-*` vars exist — use `--amber-*` for warm accents, `--danger-from/to` for red.

### Toast Notifications (`ui/Toast.tsx`)
- `ToastProvider` wraps the app in `layout.tsx` (authenticated section only)
- `useToast()` hook returns `{ showToast(message, type) }`
- Types: `"success"`, `"error"`, `"info"` (default)
- Auto-dismisses after 4 seconds; uses `aria-live="polite"` for screen readers
