/**
 * Release notes data for the What's New page.
 *
 * To add a new entry, insert an object at the TOP of the CHANGELOG array.
 * TypeScript will enforce the correct structure at compile time.
 *
 * Categories:
 *   "feature"     — Brand new functionality
 *   "improvement" — Enhancement to existing functionality
 *   "fix"         — Bug fix or resolved issue
 */

export type ChangeCategory = "feature" | "improvement" | "fix";

export interface ChangeItem {
  /** Short, user-facing description of the change */
  description: string;
  /** Category determines the badge/icon shown */
  category: ChangeCategory;
}

export interface ReleaseEntry {
  /** ISO date string (YYYY-MM-DD) used for display ordering */
  date: string;
  /** Human-readable release name (e.g., "February Update") */
  title: string;
  /** The individual changes in this release */
  changes: ChangeItem[];
}

/** Sorted newest-first. Add new entries at the top. */
export const CHANGELOG: ReleaseEntry[] = [
  {
    date: "2026-02-20",
    title: "February Update",
    changes: [
      {
        description:
          "Unified Timeline — see your photos, eBird lifers, and Haikubox detections together in one chronological view",
        category: "feature",
      },
      {
        description:
          "Search and filter your species by name and date range to quickly find what you're looking for",
        category: "feature",
      },
      {
        description:
          "Added a What's New page so you can see the latest improvements to Bird Feed",
        category: "feature",
      },
      {
        description:
          "Infinite scroll on the Timeline with sticky month navigation for easier browsing",
        category: "improvement",
      },
      {
        description:
          "Improved date filter labels on mobile for clearer From/To selection",
        category: "improvement",
      },
    ],
  },
  {
    date: "2026-01-15",
    title: "January Update",
    changes: [
      {
        description:
          "Import your eBird life list to track species you've heard or seen but haven't photographed yet",
        category: "feature",
      },
      {
        description:
          "Wish List tab on the Species page shows all the birds still on your list",
        category: "feature",
      },
      {
        description:
          "Select multiple photos at once for bulk species assignment — no more one-at-a-time tagging",
        category: "feature",
      },
      {
        description:
          "If a photo fails to upload, you can now retry just that file instead of starting over",
        category: "improvement",
      },
      {
        description:
          "Infinite scroll on Feed and public galleries replaces Previous/Next pagination",
        category: "improvement",
      },
    ],
  },
  {
    date: "2025-12-20",
    title: "December Update",
    changes: [
      {
        description:
          "Share your gallery with a public link — control who can see your photos and whether you appear in Discover",
        category: "feature",
      },
      {
        description:
          "Add personal notes, eBird checklist links, and iNaturalist observation links to each species",
        category: "feature",
      },
      {
        description:
          "Camera and lens info (EXIF data) is now displayed in photo details — optionally share your gear on your public gallery",
        category: "feature",
      },
      {
        description:
          "Public galleries show a stats strip with your species count, photo count, and most recent upload",
        category: "improvement",
      },
      {
        description:
          "Beautiful social preview cards when sharing your gallery link on social media",
        category: "improvement",
      },
    ],
  },
];
