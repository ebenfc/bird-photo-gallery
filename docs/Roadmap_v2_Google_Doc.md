BirdFeed Feature Roadmap v2


HOW TO USE THIS DOCUMENT

This is the product roadmap for BirdFeed, based on user research (5 personas) and competitive market research. It's organized into phases with a suggested build order at the end.

Please comment freely! Here are some things that would be especially helpful:
- "Love this" or "Don't care about this" on individual features
- "This should be higher/lower priority" on the build order
- Ideas for features we haven't thought of
- Reactions to the "What We're NOT Building" section — anything you disagree with?
- General vibes: does the overall direction feel right?

Use Google Docs commenting (highlight text, right-click, "Comment") to leave feedback on specific sections.


————————————————————————


CONTEXT

User research identified 5 personas and found that curation velocity, rich photo context, and light ecosystem linking are the highest-value gaps. Market research validated these and added a strategic lens: BirdFeed's unique position is as a "bird-aware media hub" — the only tool that unifies photos and Haikubox audio detections with species intelligence. No incumbent does this. [Sara: The priority linkage should be API to life lists from eBird rather than HaikuBox for the Pokemon (will find better name later) feature (i.e., birds-not-yet photographed). HaikuBox should also be an optional add-on, but eBird life lists are FAR more common and used by nearly all birders.]

The 5 Personas (from user research):
- Artistic Adam — Serious photographer, cares about presentation, gear metadata, portfolio quality
- Serious Steve — High-volume uploader, wants efficiency, bulk operations, power-user tools
- Lister Linda — Documentation-focused, wants life list feel, links to eBird, tracks firsts
- Backyard Betty — Casual, delightful experience, loves her Haikubox, values memories over data
- Newbie Nora — New to birding, learning, wants educational context and simplicity

Key Strategic Insight: Nobody else unifies bird photos + audio detections in a media-first, species-aware interface. eBird is checklist-first. Lightroom doesn't understand birds. Merlin doesn't manage media. Apple/Google Photos aren't species-aware. BirdFeed sits in the white space between all of them. Every feature should strengthen that position.


————————————————————————


PHASE 1: CURATION VELOCITY

The #1 recommendation from both research documents. Making it fast and satisfying to organize your bird photos. [Sara: Consider whether to allow two tags on one photo (if photo has more than one species) OR simply add an FAQ to instruct users to upload same photo multiple times to tag multiple species. The latter is simpler for coding, but more cumbersome for user.]


1.1 Enhanced EXIF Metadata Extraction — Small effort

What it does: When you upload a photo, BirdFeed automatically extracts and saves camera info — camera body, lens, ISO, aperture, shutter speed, and focal length. This info is shown in an expandable section when viewing a photo.

Why it matters: Photographers care about their gear data. Lightroom and Photo Mechanic users expect metadata to travel with their photos. This is foundational — it enables the "Photo Gear Display" feature later.

Who benefits most: Artistic Adam, Serious Steve

[COMMENT PROMPT: How important is camera/gear metadata to you personally? Would you look at this info on other people's photos?] [Sara: Yes, this is important to a large proportion of birders]


1.2 Favorites-First Filtering — Small effort

What it does: Adds a "Favorites only" toggle to the gallery feed. You can already favorite photos, but there's no way to filter to just your favorites.

Why it matters: Apple Photos and Google Photos have trained everyone to expect smart filtering. This is the most-requested feature across both research documents. Table stakes.

Who benefits most: Everyone

[COMMENT PROMPT: Beyond favorites, are there other filters you'd want? (e.g., "photos without a species assigned," "photos from this month")] [Sara: Other filters would be useful, but I don't want the features to get too crowded. It should be simple, clean, easy for non-birders to scroll and enjoy if shared with them by a birder friend. Other filters that would be useful are "Lifer" and the ability to add custom tags so that people can tag a particular birding location or trip]


1.3 Bulk Species Assignment — Medium effort

What it does: Select multiple unassigned photos at once and assign them all to the same species in one action, instead of one at a time.

Why it matters: If you upload 30 photos from a birding trip, assigning species one-by-one is tedious. Bulk operations are expected by anyone who uses Lightroom or similar tools.

Who benefits most: Serious Steve, Artistic Adam

[COMMENT PROMPT: How often do you upload many photos at once? Is this a pain point you've experienced?] [Sara: I regularly upload multiple photos at once, but it is not a pain point. What is a pain point is needing to scroll through the species list and having to manually add new species each time you want to add a new bird for the first time. I recommend an API to populate the species list from the user's eBird life list. I also recommend adding a search bar when assigning species so that the user can quickly filter the list rather than having to scroll through the entire list to find the species they want to assign. Bulk species assignment is still useful, especially for users establishing their Bird Feed for the first time, and should be retained. However, the default should be to assign individually since this will be more common with the 8 photo limit per species.]


1.4 Upload Error Recovery — Small/Medium effort

What it does: When uploading multiple photos, shows progress per file, lets you retry individual failed uploads, and gives clear error messages for each file.

Why it matters: Right now if an upload fails, the experience isn't great. Reliability matters most for people who upload frequently.

Who benefits most: Serious Steve, Artistic Adam [Sara: This benefits everyone]


————————————————————————


PHASE 2: BIRD-AWARE INTELLIGENCE

This is where BirdFeed becomes more than a photo gallery. It already has photos AND Haikubox audio detections — but they live on separate pages. Connecting them is the #1 market differentiation opportunity. [Sara: The concept is correct, but the product is not the best to link to for this intelligence. The link should be to eBird life lists and not to Haikubox. Haikubox should be retained as an optional feature, but it is used by birders infrequently whereas eBird life lists are ubiquitous.]


2.1 Unified Photo + Detection Timeline — Medium/Large effort

What it does: A single chronological view that interleaves your photos and Haikubox detections. For example: "February 5: You photographed a Red-tailed Hawk. February 5: Haikubox heard a Varied Thrush (3 detections)."

Why it matters: This is THE feature nobody else has. No competitor provides a unified, media-first bird timeline. The data already exists in BirdFeed — this feature connects the dots. This is the big differentiator.

Who benefits most: Everyone — especially Backyard Betty (delightful) and Lister Linda (documentation)

[COMMENT PROMPT: How exciting is this idea to you? Would you check this timeline regularly? What would make it most useful — daily view, weekly view, species-grouped?] [Sara: This is moderately exciting. It is exciting for users who own a Haikubox, however not many birders own a Haikubox and it has an associated annual cost which might be a deterrent for use. However, a unified life list and photography log would be exciting to many birders. It would allow them to quickly build their species list in the eBird app that they already use, and then import the data directly into a bird photography app.]


2.2 First-of-Season Highlights — Small effort

What it does: Automatically flags the first photo or Haikubox detection of each species per year. Shows a "First Varied Thrush of 2026!" badge on the timeline or species card.

Why it matters: "First-of-season" is inherently exciting for birders. Combined with Haikubox data (which runs 24/7), BirdFeed can tell you about firsts you didn't even witness in person. Unique to BirdFeed.

Who benefits most: Lister Linda, Backyard Betty

[COMMENT PROMPT: Would you want notifications for first-of-season detections, or is a badge/label enough?] [Sara: No. We should keep notifications to a minimum. Some birds are not seasonal, and therefore first-of-season is irrelevant. Also, this feature is already done better by eBird and I recommend not attempting to duplicate an already existing service.]


2.3 Species Notes — Small effort

What it does: Add personal notes to any species entry. Separate from the Wikipedia description that's already there. Your own observations, memories, or context.

Why it matters: Simple but personal. "First time I saw this was at Grandma's house." Turns a species page from reference material into a journal.

Who benefits most: Lister Linda, Backyard Betty


2.4 "First Photographed" Badge — Small effort

What it does: Shows "First photographed: March 12, 2025" on each species card. Turns your species list into a proto-life list without trying to replicate eBird.

Why it matters: Quick win that adds a "life list feel" without the overhead of a full life list feature. The data already exists — it just isn't surfaced yet.

Who benefits most: Lister Linda, everyone

[COMMENT PROMPT: Would "first detected by Haikubox" date also be interesting alongside "first photographed"?] [Sara: No, detection by Haikubox is not a priority and should not be added. However, "first added to life list" would be an interesting date alongside "first photographed"]


————————————————————————


PHASE 3: GALLERY & SHARING

Making public galleries feel like portfolios, not just photo dumps.


3.1 Share Card / OG Image Generation — Medium effort

What it does: When someone shares their BirdFeed gallery link on social media, iMessage, or Slack, it shows a nice preview card with their cover photo, display name, and species/photo counts — instead of a generic link.

Why it matters: Good preview cards make sharing feel premium. This is high-visibility for low effort — every shared link becomes an ambassador for BirdFeed.

Who benefits most: Everyone who shares their gallery, especially Artistic Adam

[COMMENT PROMPT: What would make you want to share your BirdFeed link? What would a compelling preview card look like to you?] [Sara: I would want to share with fellow birders and also friends and family who are not birders. This is a good idea because aesthetic and ease of viewing in mobile is high priority]


3.2 Public Gallery Statistics — Small effort

What it does: Shows lightweight stats on public profiles: species count, photo count, member since. Explicitly non-competitive — no leaderboards, no rankings.

Why it matters: Gives visitors context about a gallery. "This person has 47 species and 200+ photos" sets expectations.

Who benefits most: All public gallery users


3.3 "Recently Added" on Public Gallery — Small effort

What it does: Shows the most recently added photos on someone's public profile landing page.

Why it matters: Gives return visitors something fresh to see. Simple but makes public galleries feel alive.

Who benefits most: Gallery visitors, Backyard Betty


3.4 Xeno-Canto Audio Enrichment — Small/Medium effort

What it does: Embeds example bird calls on species detail pages using the free Xeno-Canto API. A "Listen to this species" audio player.

Why it matters: Adds educational depth that no photo-focused competitor offers. Free API, no authentication required. Especially valuable for newer birders learning to identify calls.

Who benefits most: Newbie Nora, Backyard Betty, Lister Linda

[COMMENT PROMPT: Would you actually use an audio player on species pages? Or is this more of a "nice to have" that you'd rarely click?] [Sara: Do not add this feature. It already exists in "All About Birds" which is already linked on photo and it does not make sense to try to duplicate an existing high-quality bird call feature that birders already use. This also strays from the focus of BirdFeed, which is to display photos and not provide bird information or identification.]


3.5 Download Original Photo — Small effort

What it does: Lets you download your own original-quality uploads. Private to the gallery owner only.

Why it matters: Peace of mind that BirdFeed isn't a black hole for your photos. You can always get your originals back.

Who benefits most: Artistic Adam, Serious Steve


————————————————————————


PHASE 4: ECOSYSTEM INTEGRATION

The philosophy: link to eBird and iNaturalist, don't replicate them. Start with simple outbound links, build toward deeper integration over time.


Phase 4a: Outbound Links (build now)

4a.1 eBird Checklist Link per Species — Small effort

What it does: Optional "View on eBird" link on each species entry. You paste in an eBird checklist URL and it shows as a link on the species page. [Sara: This is great and should be prioritized.]

Why it matters: Connects BirdFeed to the broader birding ecosystem without trying to replace eBird. Respects that many birders maintain both.

Who benefits most: Lister Linda, Serious Steve


4a.2 iNaturalist Link per Species — Small effort

What it does: Same idea — optional iNaturalist observation URL per species. [Sara: This might be useful, but many birders don't use iNaturalist at all, so keep this as optional.]

Who benefits most: Lister Linda, Newbie Nora


4a.3 Haikubox Year in Review — Medium effort

What it does: An annual summary of your Haikubox data: total species heard, most frequent visitor, seasonal peaks, new arrivals. Shareable as an image card.

Why it matters: The data already exists. A year-in-review is inherently shareable and delightful. Think Spotify Wrapped but for your backyard birds.

Who benefits most: Backyard Betty, Lister Linda

[COMMENT PROMPT: How excited would you be about a "Year in Review" for your Haikubox? Would you share it?] [Sara: Low priority. This would be exciting for users who own a Haikubox, but that number will be small, like maybe 5% or less of users]


Phase 4b: Integration Hub (future vision — not building yet)

These are longer-term ideas. Listing them for directional thinking, not immediate action:

- Merlin-Assisted Species Suggestions: During upload, suggest species based on Merlin ID. Requires understanding Merlin's capabilities (no public API currently). [Sara: This might be a good idea, but I highly doubt it will ever be possible.]
- iNaturalist Direct Push: Push observations directly to iNaturalist via their API. [Sara: No, this is not a good idea.]
- eBird Export Helper: Generate pre-filled checklist data you can manually submit to eBird. [Sara: This might be helpful, but it is unlikely that users will want to move data from BirdFeed to eBird because it will probably be the other way around]
- Lightroom Export Preset: Go straight from Lightroom editing to your BirdFeed gallery. [Sara: Yes, this is a good idea]

[COMMENT PROMPT: Any of these future ideas particularly exciting or not worth pursuing?]


————————————————————————


PHASE 5: SEARCH & POLISH

Making it easy to find specific photos and displaying rich metadata.


5.1 Advanced Gallery Search — Medium effort

What it does: Search and filter by species name, date range, favorites, and notes content.

Why it matters: As galleries grow, finding specific shots becomes harder. Fast search is table stakes for any media management tool. [Sara: Yes, this is a good idea as long as it is user-friendly and does not clutter the user interface. It should be a feature only accessible to the user and not to viewers of the shared gallery.]

Who benefits most: Serious Steve, Lister Linda


5.2 Photo Gear Display — Small effort

What it does: Shows camera and lens info (from Phase 1.1) on species pages and public galleries. Subtle metadata, not in-your-face.

Who benefits most: Artistic Adam, Newbie Nora
[Sara: Yes this is a good feature, but should be OPTIONAL and not automated]


————————————————————————


WHAT WE'RE NOT BUILDING

Both research documents agree on these boundaries:

- Social features (comments, likes, follows): Keeps the "no metrics, no algorithms" promise
- In-app bird ID / AI identification: Complement Merlin, don't replace it
- eBird data import / checklist sync: Link out to eBird, don't ingest their data
- Automated eBird submission: eBird's policy prohibits automated unattended submissions
- Leaderboards / competitive gamification: Contradicts the privacy-first brand
- RAW file processing: Users pre-process in Lightroom. BirdFeed stays downstream
- Pro editing tools: Defer to Lightroom
- Map views / GPS features: High complexity, eBird owns mapping. Revisit if demand emerges
- Full life list: eBird owns this. Phases 2.4 + 4a.4 give a "life list feel" instead

[COMMENT PROMPT: Anything on this list you actually DO want? Anything missing that should be on the "won't build" list?] [Sara: No, this exclusionary list is accurate. Simplicity, only filling existing gaps, and navigability are key.]


————————————————————————


COMPETITIVE THREATS TO MONITOR

Features to watch from competitors that could compress BirdFeed's value:

- If eBird adds robust media management: Our gallery value gets compressed. We'd double down on timeline UX, Haikubox integration, and portfolio theming.
- If Lightroom adds bird ID / taxonomy tags: The "bird-aware" gap narrows. We'd emphasize species intelligence, rarity features, and simplicity.
- If Merlin adds media management / life list: Casual users might get absorbed. We'd focus on photography-first users who need curation, not just ID.
- If Birda expands photo management: Social + photos overlap. We'd differentiate on privacy, no-algorithm philosophy, and quality curation.


————————————————————————


SUGGESTED BUILD ORDER

Balances quick wins, user impact, and strategic positioning. Numbers refer to the feature IDs above.

1. Enhanced EXIF Metadata (1.1) — Small: Foundation for gear display. Immediate data enrichment with zero UI risk.
2. Favorites Filtering (1.2) — Small: Quick win. The highest-frequency request across both research docs.
3. Species Notes (2.3) — Small: Quick win. Simple change, high personal value.
4. First Photographed Badge (2.4) — Small: Quick win. No database changes needed, just surfaces existing data.
5. eBird Link (4a.1) — Small: Quick win. Tiny change that addresses the "connect to eBird" request.
6. Bulk Species Assignment (1.3) — Medium: Core curation velocity. Competitive parity with bulk tools.
7. First-of-Season Highlights (2.2) — Small: High delight. Unique to BirdFeed. Builds on existing data. [Sara: Do not add. Because BirdFeed only allows 8 photos per species, this becomes almost irrelevant. Also, many species are year-round residents, and so this does not apply to non-migratory birds]
8. Share Card / OG Images (3.1) — Medium: High visibility for shared links. Strengthens portfolio positioning.
9. Upload Error Recovery (1.4) — Medium: Reliability for power users.
10. Unified Timeline (2.1) — Medium/Large: THE big differentiator. Scheduled after quick wins are shipped and the codebase is stable. [Sara: Yes, add this feature but prioritize unified timeline with eBird life list instead of Haikubox]
11. Xeno-Canto Audio (3.4) — Small/Medium: Unique educational enrichment. [Sara: Do not add this. It is already a feature in "All About Birds" which is linked in every photo.]
12. Public Gallery Stats (3.2) — Small: Polish for public galleries.
13+. Remaining features: Prioritized based on user feedback after the above ships.

[COMMENT PROMPT: Does this order feel right? Anything you'd move up or down? Any features you'd cut entirely?] [Sara: Entirely cut First-of-Season Highlights (2.2) and Xeno-Canto Audio (3.4). I would add Recently Added (3.3) and eBird checklist link per species (4a.1) and an API to the eBird Life List to pre-populate species and generate a "birds-not-yet-photographed" list in BirdFeed.]


————————————————————————


HOW THIS MAPS TO BRAND POSITIONING

Each brand promise maps to specific features:

"Bird-aware media hub"
- Unified Timeline (2.1), First-of-Season Highlights (2.2), Xeno-Canto Audio (3.4)

"All your bird media, understood"
- EXIF Metadata (1.1), Bulk Assignment (1.3), Advanced Search (5.1)

"Simpler than eBird for casuals"
- Favorites Filtering (1.2), Species Notes (2.3), First Photographed Badge (2.4)

"More bird-smart than Photos/Lightroom"
- First-of-Season (2.2), rarity badges (already built), Haikubox integration (already built)

"Effortless export, not duplication"
- eBird Link (4a.1), iNaturalist Link (4a.2), Export Helper (future)

"Privacy-first, no algorithms"
- Share Cards (3.1), Non-competitive Stats (3.2), no social features

[COMMENT PROMPT: Does the brand positioning resonate? Any of these taglines feel off, or is there a positioning angle we're missing?]
