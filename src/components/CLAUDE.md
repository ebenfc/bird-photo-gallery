# Components

Components are organized by feature area.

## Directory Structure

| Folder | Purpose |
|--------|---------|
| `activity/` | Haikubox activity page components |
| `gallery/` | Photo gallery and modal components |
| `landing/` | Public landing page for unauthenticated users |
| `layout/` | Header, navigation, PublicHeader |
| `settings/` | User settings forms (public gallery) |
| `species/` | Species cards and forms |
| `stats/` | Property stats widget |
| `suggestions/` | AI suggestion components |
| `ui/` | Reusable UI primitives |
| `upload/` | Photo upload components |

## Activity Components (`activity/`)

| Component | Purpose |
|-----------|---------|
| `HaikuboxSetupCard` | Inline setup flow for connecting a Haikubox (two paths: own device or public device) |
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

## UI Components (`ui/`)

Reusable primitives: buttons, inputs, modals, badges, loading states, toast notifications.
Use these instead of creating one-off styled elements.

### Toast Notifications (`ui/Toast.tsx`)
- `ToastProvider` wraps the app in `layout.tsx` (authenticated section only)
- `useToast()` hook returns `{ showToast(message, type) }`
- Types: `"success"`, `"error"`, `"info"` (default)
- Auto-dismisses after 4 seconds; uses `aria-live="polite"` for screen readers
