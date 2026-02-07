# Public API Routes (`/api/public`)

## Purpose
Read-only API endpoints for public gallery access. No authentication required.

## Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/public/discover` | GET | Browse directory-listed galleries |
| `/api/public/gallery/[username]` | GET | Profile info (name, counts) |
| `/api/public/gallery/[username]/photos` | GET | List photos with filtering |
| `/api/public/gallery/[username]/species` | GET | List species |
| `/api/public/gallery/[username]/species/[id]` | GET | Single species detail |

## Security Requirements

1. **Visibility Check**: Every endpoint MUST verify:
   ```typescript
   const user = await getUserByUsername(username);
   if (!user || !user.isPublicGalleryEnabled) {
     return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
   }
   ```

2. **Data Isolation**: Filter all queries by the profile owner's userId

3. **No Sensitive Data**: Never return:
   - Haikubox detection data (location-sensitive)
   - User email or Clerk ID
   - Internal implementation details

4. **Rate Limiting**: Apply read rate limits to prevent abuse (uses standard `RATE_LIMITS.read`)

## Query Parameters (Photos Endpoint)
Supports same filters as authenticated `/api/photos`:
- `speciesId` - Filter by species
- `favorites` - Show favorites only
- `rarity` - Filter by rarity (common,uncommon,rare)
- `sort` - Sort order (recent_upload, oldest_upload, species_alpha, recent_taken)
- `page`, `limit` - Pagination

## Query Parameters (Species Endpoint)
- `sort` - Sort order (alpha, photo_count, recent_added, recent_taken)

## Discover Endpoint

`GET /api/public/discover` — browse galleries where `isPublicGalleryEnabled=true` AND `isDirectoryListed=true`.

Query params: `state` (2-letter code), `sort` (alpha|random), `page`, `limit`.
Returns: username, displayName, city, state, speciesCount, photoCount, pagination metadata.
No auth required. Never sorts by popularity.

## Files
- `discover/route.ts` - Browse directory-listed galleries
- `gallery/[username]/route.ts` - Profile info
- `gallery/[username]/photos/route.ts` - Photos list
- `gallery/[username]/species/route.ts` - Species list
- `gallery/[username]/species/[id]/route.ts` - Species detail

## Key Differences from Authenticated Endpoints
1. No `requireAuth()` call - these are public
2. User lookup via `getUserByUsername()` instead of auth context
3. No Haikubox detection data returned
4. Read-only (no POST/PATCH/DELETE methods)
