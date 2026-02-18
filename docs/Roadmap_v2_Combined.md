# Feature Roadmap v2: User Research + Market Research

> Combines insights from [User Research](./Bird_Photographer_User_Research_Insights.md) and [Market Research](./Bird_Feed_Market_Research.md)

## Context

**User research** identified 5 personas and found that **curation velocity**, **rich photo context**, and **light ecosystem linking** are the highest-value gaps. **Market research** validated these and added a strategic lens: BirdFeed's unique position is as a **"bird-aware media hub"** — the only tool that unifies photos and Haikubox audio detections with species intelligence. No incumbent does this.

The combined roadmap keeps the user research's persona-driven prioritization while layering in market-driven differentiation opportunities and competitive positioning.

### Key Strategic Insight

The market research identifies BirdFeed's competitive moat: **nobody else unifies bird photos + audio detections in a media-first, species-aware interface**. eBird is checklist-first. Lightroom doesn't understand birds. Merlin doesn't manage media. Apple/Google Photos aren't species-aware. BirdFeed sits in the white space between all of them. Every feature should strengthen that position.

> **User review note (Sara):** The primary ecosystem link should be **eBird life lists**, not Haikubox. Nearly all birders use eBird; Haikubox is a niche add-on (~5% of users). Features should prioritize eBird integration, with Haikubox as an optional enrichment layer.

---

## Phase 1: Curation Velocity

*The #1 recommendation from both research documents. User research says "curation velocity and joy." Market research classifies fast search, favorites, and species tagging as table stakes.*

### 1.1 Enhanced EXIF Metadata Extraction — Small

Extract camera body, lens, ISO, aperture, shutter speed, and focal length from uploaded photos. `exifr` already parses EXIF in `src/lib/image.ts` but only reads `DateTimeOriginal`.

- **Schema**: Add nullable columns to `photos`: `cameraMake`, `cameraModel`, `lensModel`, `iso`, `aperture`, `shutterSpeed`, `focalLength`
- **Display**: Metadata section in PhotoModal (gear icon, expandable)
- **Personas**: Artistic Adam, Serious Steve
- **Market context**: Photo Mechanic and Lightroom users expect metadata consistency. Preserving EXIF through BirdFeed reduces the "metadata drift" pain point both documents highlight

### 1.2 Favorites-First Filtering — Small

Add a "Favorites only" toggle to the gallery feed. Currently favorites exist but can't be filtered.

- **Where**: `GalleryFilters` component + `isFavorite` query param on `/api/photos`
- **Personas**: All — both documents call this out explicitly
- **Market context**: Apple Photos and Google Photos have trained users to expect smart filtering. This is table stakes
- **Future filter ideas**: "Lifer" filter and custom tags for birding locations/trips. Keep UI clean and simple — non-birders should be able to scroll and enjoy shared galleries

### 1.3 Bulk Species Assignment — Medium

Multi-select unassigned inbox photos and assign them all to the same species in one action.

- **Where**: Multi-select mode on Feed page, bulk action bar, reuse `SpeciesAssignModal` patterns
- **API**: Extend existing `PATCH /api/photos` bulk endpoint with species assignment + swap handling
- **Personas**: Serious Steve (efficiency at scale), Artistic Adam (batch workflow)
- **Market context**: Lightroom and Photo Mechanic users expect bulk operations. Market research classifies this as competitive parity
- **User review note**: The bigger pain point is scrolling through the species list and manually adding new species. **Higher priority UX improvement: add a search bar to the species assignment modal** so users can type-to-filter instead of scrolling. eBird Life List import (4a.4) would further reduce this friction. Bulk assignment is still useful but individual assignment should remain the default

### 1.4 Upload Error Recovery — Small/Medium

Per-file progress indicators, retry failed uploads individually, clear error messages per file.

- **Where**: Enhance `UploadModal.tsx` retry logic and error states
- **Personas**: Everyone
- **Market context**: Both documents emphasize reliability for high-volume users. "Prioritize robust file handling" (user research). "Photo import from camera roll/folders" is table stakes (market research)

---

## Phase 2: Bird-Aware Intelligence

*This is where market research adds the most value. BirdFeed already has photos AND Haikubox detections — but they live on separate pages. Connecting them is a market differentiation opportunity. Per user review, the primary intelligence connector should be **eBird life lists** (ubiquitous among birders), with Haikubox as an optional enrichment layer.*

### 2.1 Unified Photo + Life List Timeline — Medium/Large

Create a single chronological view that interleaves photos, eBird life list data, and (optionally) Haikubox detections. "February 5: You photographed a Red-tailed Hawk. February 5: Haikubox heard a Varied Thrush (3 detections). March 1: Red Crossbill added to eBird life list — not yet photographed!"

- **Where**: New timeline view on Feed or dedicated tab. Query `photos` (by `originalDateTaken`), eBird life list data (from 4a.4 import), and optionally `haikuboxActivityLog` (by `detectedAt`), merge chronologically
- **Personas**: All — especially Backyard Betty (delightful) and Lister Linda (documentation)
- **Market context**: Identified as BirdFeed's #1 differentiation opportunity. "No incumbent provides a simple, unified, media-centric bird timeline." A unified life list + photography log is exciting to many birders — allowing them to bridge eBird data with their photo collection
- **Brand**: Reinforces "bird-aware media hub" positioning
- **User review note**: Prioritize eBird life list integration over Haikubox. A unified life list + photography log has broader appeal than Haikubox-only timeline (~5% of users have Haikubox vs. nearly all birders use eBird)

### ~~2.2 First-of-Season Highlights — CUT~~

> **Cut per user review:** Many birds are year-round residents, making "first-of-season" irrelevant for non-migratory species. eBird already does this better. With the 8-photo-per-species limit, this feature has limited value. Recommend not duplicating an existing eBird service.

### 2.3 Species Notes — Small

Add personal notes per species entry, separate from the Wikipedia-sourced description.

- **Schema**: Add `userNotes` text column to `species` table
- **Display**: Editable section on species detail page
- **Personas**: Lister Linda (documentation), Backyard Betty (memories)

### 2.4 "First Photographed" Badge — Small

Show "First photographed: [date]" on species cards. Turns the species list into a proto-life list without duplicating eBird. If eBird Life List import (4a.4) is available, also show "First added to life list: [date]" alongside.

- **Where**: `SpeciesCard` — query earliest `originalDateTaken` per species
- **Personas**: Lister Linda, all users
- **Already stored**: `originalDateTaken` exists, just not surfaced
- **Future enhancement**: "First added to life list" date from eBird import (4a.4) — pairs naturally with "first photographed"

---

## Phase 3: Gallery & Sharing

*User research's #10 pain point: "Sharing curated portfolios without building a full website." Market research reinforces: BirdFeed should feel like a portfolio, not a feed.*

### 3.1 Share Card / OG Image Generation — Medium

Generate Open Graph preview images so shared `/u/username` links look compelling on social media and messaging apps.

- **Implementation**: Next.js `ImageResponse` (built-in) with user's cover photo, display name, and species/photo counts
- **Personas**: All sharing users, especially Artistic Adam
- **Market context**: "Privacy-first sharing" is a market differentiator. Good OG cards make sharing feel premium without needing a social feed

### 3.2 Public Gallery Statistics — Small

Show lightweight, non-competitive stats on public profiles: species count, photo count, member since. No leaderboards.

- **Where**: Public profile layout at `/u/[username]`
- **Personas**: All public gallery users
- **Market context**: Market research notes "personal stat cards" as a differentiation feature — but explicitly non-competitive to match BirdFeed's anti-algorithm brand

### 3.3 "Recently Added" on Public Gallery — Small

Show most recently added photos on the public profile landing page. Gives return visitors something fresh.

- **Where**: Public gallery page, use existing `uploadDate` sorting
- **Personas**: Gallery visitors, Backyard Betty

### ~~3.4 Xeno-Canto Audio Enrichment — CUT~~

> **Cut per user review:** This feature already exists in "All About Birds," which is already linked from species pages in the app. Duplicating an existing high-quality bird call feature doesn't add value and strays from BirdFeed's core focus on photo display, not bird information or identification.

### 3.5 Download Original Photo — Small

Let gallery owners download their original-quality uploads. Private to the owner only.

- **Where**: PhotoModal action menu, new API endpoint to serve from Supabase storage
- **Personas**: Artistic Adam, Serious Steve

---

## Phase 4: Ecosystem Integration

*User research says "link to eBird, don't replicate." Market research adds nuance: start with links, build toward an "integration hub" over time. Phase 4a is buildable now; Phase 4b is the strategic vision.*

### Phase 4a: Outbound Links (build now)

#### 4a.1 eBird Checklist Link per Species — Small ★ High Priority

Optional eBird checklist URL on each species entry. "View on eBird" outbound link.

- **Schema**: Add `ebirdChecklistUrl` text column to `species`
- **UI**: Optional URL field on species edit form, link icon on species detail page
- **Personas**: Lister Linda, Serious Steve
- **User review note**: "This is great and should be prioritized." Connects BirdFeed to the broader birding ecosystem

#### 4a.2 iNaturalist Link per Species — Small

Same pattern — optional iNaturalist observation URL per species.

- **Schema**: Add `inatObservationUrl` text column to `species`
- **Personas**: Lister Linda, Newbie Nora
- **User review note**: Keep optional — many birders don't use iNaturalist at all

#### 4a.3 Haikubox Year in Review — Medium ⚠️ Low Priority

Annual summary: total species heard, most frequent, seasonal peaks, new arrivals. Shareable as an image card.

- **Data**: Already in `haikuboxDetections` and `haikuboxActivityLog`
- **Personas**: Backyard Betty, Lister Linda
- **User review note**: Low priority — estimated ~5% or less of users own a Haikubox

#### 4a.4 eBird Life List Import — Medium ★ New Feature

Import species from a user's eBird life list to pre-populate their BirdFeed species list and generate a "not yet photographed" wish list. This is the "Pokemon" feature — showing birders which species they've observed but haven't yet captured with their camera.

- **API**: eBird API 2.0 (public, requires API key). Endpoints: `GET /v2/product/lists/{regionCode}` or profile-based life list retrieval
- **Schema**: May need `ebirdSpeciesCode` on `species` table for mapping, plus a way to store "observed but not photographed" species
- **UI**: Settings page integration (enter eBird username or region). Species page shows "not yet photographed" badge. Potential dedicated "wish list" view
- **Personas**: Lister Linda (life list feel), Serious Steve (efficiency), Everyone (reduces species assignment friction)
- **Related UX**: Also add a **search bar to the species assignment modal** — user feedback identified scrolling through the full species list as the #1 pain point during species assignment. eBird import + search bar together dramatically improve species assignment UX
- **Market context**: eBird life lists are used by nearly all birders. This bridges the gap between eBird's checklist-first approach and BirdFeed's photo-first approach, creating a unique "what haven't I photographed yet?" motivation loop

### Phase 4b: Integration Hub (strategic vision — not yet scoped for build)

These are longer-term opportunities identified by market research. They require API research, prototyping, and potentially partnerships. Listing them here for strategic direction, not immediate implementation.

- **Merlin-Assisted Species Suggestions**: During upload, suggest species based on Merlin ID output. Would require understanding Merlin's data handoff capabilities (currently no public API). *User review: "Might be a good idea, but I highly doubt it will ever be possible."*
- ~~**iNaturalist API Write**~~: Push observations directly to iNaturalist via their OAuth API. *User review: "Not a good idea." — Cut from future vision*
- **eBird Export Concierge**: Generate pre-filled checklist data that users can manually submit to eBird (respecting eBird's no-automated-submission policy). *User review: "Data flow will probably go the other way (eBird → BirdFeed)." Deprioritize in favor of eBird import (4a.4)*
- **Lightroom Export Preset**: A Lightroom export preset that targets BirdFeed's upload endpoint, so users can go straight from editing to their gallery. *User review: "Yes, this is a good idea."*

---

## Phase 5: Search & Polish

*Market research classifies "fast search" as table stakes. User research calls out the need for finding specific shots quickly.*

### 5.1 Advanced Gallery Search — Medium

Search/filter by: species name (text), date range, favorites, and notes content.

- **Where**: Search bar on Feed page + filter controls
- **API**: Add query params to `/api/photos` and `/api/species`
- **Personas**: Serious Steve, Lister Linda
- **Constraint**: Owner-only feature — not visible on public gallery pages. Keep UI user-friendly and uncluttered

### 5.2 Photo Gear Display — Small

Surface EXIF metadata (from 1.1) on species pages and public galleries. Camera + lens info as subtle metadata.

- **Dependency**: Phase 1.1
- **Personas**: Artistic Adam, Newbie Nora
- **Constraint**: Must be **optional** per user preference, not automated. Users should choose whether to display gear info

---

## What We're NOT Building

Both research documents converge on these:

| Feature | Why Not | Source |
|---|---|---|
| Social features (comments, likes, follows) | "Keep 'no metrics, no algorithms' promise" | Both |
| In-app bird ID / AI identification | "Complement Merlin, don't replace" | Both |
| eBird data import / checklist sync | "Do not ingest eBird data" — link out | Both |
| Automated eBird submission | eBird policy prohibits automated unattended submissions | Market |
| Leaderboards / competitive gamification | Contradicts privacy-first brand | Both |
| RAW file processing | Users pre-process in Lightroom. BirdFeed stays downstream | Both |
| Pro editing tools | "Won't build. Defer to Lightroom" | Market |
| Map views / GPS features | High complexity, eBird owns mapping. Revisit if demand emerges | User |
| Full life list | eBird owns this. Phase 2.4 + 4a.4 give "life list feel" | User |

---

## Competitive Threats to Monitor

From market research — features to watch that could compress BirdFeed's value:

| Threat | If It Happens | Our Response |
|---|---|---|
| eBird adds robust media management | Core gallery value compressed | Double down on timeline UX, Haikubox unification, and portfolio theming |
| Lightroom adds bird ID / taxonomy tags | "Bird-aware" gap narrows | Emphasize species intelligence, rarity, exports, and simplicity |
| Merlin adds media management / life list | Casual users absorbed | Focus on photography-first users (Artistic Adam, Serious Steve) who need curation, not just ID |
| Birda expands photo management | Social + photos overlap | Differentiate on privacy, no-algorithm, and quality curation over engagement |

---

## Suggested Build Order

Balances quick wins, user impact, and strategic positioning:

| # | Feature | Scope | Rationale |
|---|---|---|---|
| 1 | 1.1 Enhanced EXIF | Small | Foundation for gear display; immediate data enrichment; zero UI risk |
| 2 | 1.2 Favorites Filtering | Small | Quick win; highest-frequency request across both docs |
| 3 | 2.3 Species Notes | Small | Quick win; simple schema + UI change |
| 4 | 2.4 First Photographed Badge | Small | Quick win; no schema change, just a query |
| 5 | 4a.1 eBird Link | Small | Quick win; high priority per user review; connects to eBird ecosystem |
| 6 | 3.3 Recently Added on Public Gallery | Small | Quick win; makes public galleries feel alive |
| 7 | 1.3 Bulk Species Assignment | Medium | Core curation velocity; include search bar for species assignment modal |
| 8 | 3.1 Share Card / OG Images | Medium | High visibility for shared links; strengthens portfolio positioning |
| 9 | 1.4 Upload Error Recovery | Medium | Reliability for all users |
| 10 | 4a.4 eBird Life List Import | Medium | Pre-populate species from eBird; "not yet photographed" wish list; bridges eBird + BirdFeed |
| 11 | 2.1 Unified Timeline | Medium/Large | **The big differentiator.** Prioritize eBird life list integration alongside Haikubox. Schedule after quick wins ship |
| 12 | 3.2 Public Gallery Stats | Small | Polish for public galleries |
| 13+ | Remaining features | Various | Based on user feedback after above ships |

> **Cut from build order per user review:** 2.2 First-of-Season Highlights (eBird does this better; irrelevant for year-round species), 3.4 Xeno-Canto Audio (duplicates All About Birds which is already linked)

---

## How This Maps to Brand Positioning

| Market Research Positioning | Roadmap Features That Deliver It |
|---|---|
| "Bird-aware media hub" | 2.1 Unified Timeline, 4a.4 eBird Life List Import, Haikubox (existing) |
| "All your bird media, understood" | 1.1 EXIF, 1.3 Bulk Assignment, 5.1 Search |
| "Simpler than eBird for casuals" | 1.2 Favorites, 2.3 Species Notes, 2.4 First Photographed |
| "More bird-smart than Photos/Lightroom" | 4a.4 eBird Life List Import, rarity badges (existing), Haikubox (existing) |
| "Effortless export, not duplication" | 4a.1 eBird Link, 4a.2 iNat Link, Lightroom Export Preset (future) |
| "Privacy-first, no algorithms" | 3.1 Share Cards, 3.2 Stats (non-competitive), no social features |