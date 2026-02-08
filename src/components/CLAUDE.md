# Components

Components are organized by feature area.

## Directory Structure

| Folder | Purpose |
|--------|---------|
| `activity/` | Haikubox activity page components |
| `discover/` | Discover page: BookmarkButton, GalleryCard, DiscoverFilters |
| `gallery/` | Photo gallery and modal components |
| `landing/` | Public landing page for unauthenticated users (includes `ThemeShowcase` live skin picker) |
| `layout/` | Header, navigation, PublicHeader |
| `settings/` | User settings forms on /settings page (public gallery, location, appearance/skin picker) |
| `species/` | Species cards and forms |
| `stats/` | Property stats widget |
| `suggestions/` | AI suggestion components |
| `support/` | Issue reporting (ReportIssueButton, ReportIssueModal) |
| `ui/` | Reusable UI primitives |
| `upload/` | Photo upload components |

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

## Mobile-Responsive Patterns

### Collapsible Filters
Mobile views use collapsible filter panels (Feed, Species, Activity, and Public Feed pages):
- Filters hidden by default on mobile
- "Filter" button with badge showing active filter count
- Smooth slide-down animation on expand
- Desktop filters always visible (no toggle)

### SpeciesCard (`species/SpeciesCard.tsx`)
Shared card component used by both authenticated and public species directories:
- `linkPrefix` prop controls the link target (default: `"/species"`, public view uses `"/u/{username}/species"`)
- `onEdit` prop conditionally shows the edit button (authenticated only)
- `HeardBadge` only shows when Haikubox data is present (excluded from public API)
- Photo count pill shows `"X of 8"` progress or `"Curated"` checkmark badge at limit

### SwapPicker (`species/SwapPicker.tsx`)
Reusable photo swap picker used in UploadModal and SpeciesAssignModal:
- 4-column grid of thumbnails; selected photo gets red-tinted overlay with swap icon
- Shows favorite heart indicator and warning when favorited photo selected
- Props: `photos`, `selectedPhotoId`, `onSelect`, `loading`

### SpeciesForm (`species/SpeciesForm.tsx`)
Reusable modal for creating/editing species. Used on **both** the Species page and inside the Upload modal.
- Has Wikipedia "Look up" button that auto-populates scientific name + description
- Debounced auto-lookup (800ms) when typing a new species name
- `onSubmit` receives `{commonName, scientificName?, description?, rarity?}` — the **parent** handles the API call
- After `onSubmit` resolves, SpeciesForm calls `onClose()` automatically

### Floating Action Button (FAB)
Mobile species page uses circular FAB instead of button in header.

### Photo Modal (`gallery/PhotoModal.tsx`)
Key behaviors:
- `defaultToFullscreen` prop - Opens directly in fullscreen (used on Species detail page)
- `readOnly` prop - Hides all edit controls (used for public gallery views)
- Swipe gestures - Left/right to navigate (50px minimum distance)
- Preserves view state - Swipe in fullscreen stays in fullscreen
- Escape key - Closes modal (different behavior when `defaultToFullscreen`)

### Public Header (`layout/PublicHeader.tsx`)
Minimal header for public gallery pages:
- Shows "[Name]'s Bird Feed" title with Feed/Species tabs
- No logo icon (intentionally removed pending brand finalization)
- No auth UI or edit buttons
- Includes "Create your own Bird Feed" CTA link (desktop only)
- Accepts `children` prop for rendering BookmarkButton

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
