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
`GalleryStatsStrip` renders between header and main content — shows species count, photo count, member since date.
Gallery counts use `React.cache()` via `getGalleryCounts()` for dedup between `generateMetadata` and layout body.

### Onboarding Gate Bypass
Authenticated users visiting `/u/` pages skip onboarding gates (agreement form, display name gate). This is handled by `AuthenticatedLayout` (client component) using `usePathname()` — NOT middleware. Never use middleware to pass pathname to server components; it interferes with Clerk.

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
- Settings page entirely (not accessible)

### OG Image & Social Metadata
`opengraph-image.tsx` generates a 1200x630 PNG card using `next/og` `ImageResponse`. Dark forest-green branding with display name + stats. Colors are hardcoded (Satori doesn't support CSS vars). Next.js auto-injects `<meta property="og:image">` — do NOT set `openGraph.images` manually in `generateMetadata`.

`generateMetadata` includes `openGraph` (type: profile) and `twitter` (summary_large_image) metadata.

## Files
- `layout.tsx` - Server component: validates username, fetches counts, renders stats strip, generates metadata
- `opengraph-image.tsx` - OG image card via `next/og` ImageResponse (1200x630, hardcoded colors)
- `page.tsx` - Public feed with infinite-scrolling photos grid, filters, and read-only modal
- `species/page.tsx` - Public species directory
- `species/[id]/page.tsx` - Public species detail with photos
