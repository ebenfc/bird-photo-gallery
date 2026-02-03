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

## Mobile-Responsive Patterns

### Collapsible Filters
Mobile views use collapsible filter panels (Feed, Species, Activity pages):
- Filters hidden by default on mobile
- "Filter" button with badge showing active filter count
- Smooth slide-down animation on expand

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
- Shows "[Name]'s Bird Feed" with Feed/Species tabs
- No auth UI or edit buttons
- Includes "Create your own Bird Feed" CTA link

## UI Components (`ui/`)

Reusable primitives: buttons, inputs, modals, badges, loading states.
Use these instead of creating one-off styled elements.
