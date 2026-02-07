# Public Profile Routes (`/u/[username]`)

## Purpose
Public, read-only views of user galleries accessible without authentication.

## Route Structure
- `/u/[username]` - Public feed (photos)
- `/u/[username]/species` - Public species directory
- `/u/[username]/species/[id]` - Public species detail

## Key Patterns

### Data Fetching
All pages fetch from `/api/public/gallery/[username]/*` endpoints (not the authenticated `/api/*` endpoints).

### Layout
Uses `PublicHeader` component with minimal navigation (Feed | Species tabs only).
No Clerk auth UI, no edit/upload buttons.
`BookmarkButton` rendered as child of `PublicHeader` for authenticated visitors.

### Security
- Routes are public (added to Clerk middleware's `isPublicRoute` matcher in `src/proxy.ts`)
- API endpoints verify `isPublicGalleryEnabled === true` before returning data
- All data filtered by profile owner's userId
- Layout checks user exists and gallery is public in server component (returns 404 if not)

### Component Reuse
- Reuses `PhotoGrid`, `PhotoCard`, `SpeciesCard`, `RarityBadge`, `GalleryFilters`
- `PhotoModal` used with `readOnly={true}` prop - hides all edit controls
- `SpeciesCard` used without `onEdit` callback

### What's Hidden in Public View
- Favorite button and toggle
- Edit date button
- Edit notes button
- Delete button
- Change species button
- Set as cover photo button
- Haikubox detection data (location-sensitive)
- Activity page entirely (not accessible)
- Resources page entirely (not accessible)

## Files
- `layout.tsx` - Server component that validates username and public gallery status
- `page.tsx` - Public feed with photos grid, filters, and read-only modal
- `species/page.tsx` - Public species directory
- `species/[id]/page.tsx` - Public species detail with photos
