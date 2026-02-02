import { NextRequest, NextResponse } from "next/server";

interface WikipediaSearchResult {
  query?: {
    pages?: Record<
      string,
      {
        pageid?: number;
        title?: string;
        extract?: string;
        terms?: {
          description?: string[];
        };
      }
    >;
  };
}

interface BirdLookupResult {
  commonName: string;
  scientificName: string | null;
  description: string | null;
  source: "wikipedia" | "manual";
}

/**
 * Extract scientific name from Wikipedia extract
 * Looks for patterns like "Species name (Scientific name)" or italic text
 */
function extractScientificName(
  title: string,
  extract: string
): string | null {
  // Pattern 1: Look for "(Genus species)" pattern at the start of extract
  // E.g., "The dark-eyed junco (Junco hyemalis) is a..."
  const parenMatch = extract.match(/\(([A-Z][a-z]+ [a-z]+(?:\s+[a-z]+)?)\)/);
  if (parenMatch) {
    return parenMatch[1];
  }

  // Pattern 2: Check if title itself might contain scientific name
  // E.g., "American Robin" - title alone doesn't have it
  // But extract might say "Turdus migratorius"
  const scientificPattern =
    /([A-Z][a-z]+\s[a-z]+(?:\s[a-z]+)?)\s+is\s+a\s+(?:species|bird)/i;
  const extractMatch = extract.match(scientificPattern);
  if (extractMatch) {
    const candidate = extractMatch[1];
    // Verify it looks like a scientific name (two Latin-looking words)
    if (/^[A-Z][a-z]+\s[a-z]+/.test(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Extract a short description from Wikipedia extract
 */
function extractDescription(extract: string): string | null {
  if (!extract) return null;

  // Get first sentence or two
  const sentences = extract.split(/\.\s+/);
  if (sentences.length > 0) {
    // Take first 1-2 sentences, max ~200 chars
    let desc = sentences[0];
    if (sentences.length > 1 && desc.length < 100) {
      desc += ". " + sentences[1];
    }
    // Clean up and truncate
    desc = desc.trim();
    if (desc.length > 250) {
      desc = desc.substring(0, 247) + "...";
    }
    return desc;
  }
  return null;
}

/**
 * Look up a bird species by common name using Wikipedia API
 */
async function lookupBirdFromWikipedia(
  commonName: string
): Promise<BirdLookupResult | null> {
  try {
    // Search Wikipedia for the bird
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("prop", "extracts|pageprops");
    searchUrl.searchParams.set("exintro", "true");
    searchUrl.searchParams.set("explaintext", "true");
    searchUrl.searchParams.set("exsentences", "3");
    searchUrl.searchParams.set("titles", commonName);
    searchUrl.searchParams.set("redirects", "1");
    searchUrl.searchParams.set("origin", "*");

    const response = await fetch(searchUrl.toString());
    if (!response.ok) {
      console.error("Wikipedia API error:", response.status);
      return null;
    }

    const data: WikipediaSearchResult = await response.json();

    if (!data.query?.pages) {
      return null;
    }

    // Get the first (and usually only) page result
    const pages = Object.values(data.query.pages);
    const page = pages[0];

    if (!page || page.pageid === undefined || page.pageid === -1) {
      // Page not found, try with "bird" suffix
      const birdSearchUrl = new URL("https://en.wikipedia.org/w/api.php");
      birdSearchUrl.searchParams.set("action", "query");
      birdSearchUrl.searchParams.set("format", "json");
      birdSearchUrl.searchParams.set("prop", "extracts|pageprops");
      birdSearchUrl.searchParams.set("exintro", "true");
      birdSearchUrl.searchParams.set("explaintext", "true");
      birdSearchUrl.searchParams.set("exsentences", "3");
      birdSearchUrl.searchParams.set("titles", `${commonName} (bird)`);
      birdSearchUrl.searchParams.set("redirects", "1");
      birdSearchUrl.searchParams.set("origin", "*");

      const birdResponse = await fetch(birdSearchUrl.toString());
      if (birdResponse.ok) {
        const birdData: WikipediaSearchResult = await birdResponse.json();
        const birdPages = Object.values(birdData.query?.pages || {});
        const birdPage = birdPages[0];

        if (birdPage && birdPage.pageid && birdPage.pageid !== -1) {
          const extract = birdPage.extract || "";
          return {
            commonName: commonName,
            scientificName: extractScientificName(
              birdPage.title || commonName,
              extract
            ),
            description: extractDescription(extract),
            source: "wikipedia",
          };
        }
      }

      return null;
    }

    const extract = page.extract || "";
    return {
      commonName: commonName,
      scientificName: extractScientificName(page.title || commonName, extract),
      description: extractDescription(extract),
      source: "wikipedia",
    };
  } catch (error) {
    console.error("Wikipedia lookup error:", error);
    return null;
  }
}

// GET /api/birds/lookup?name=Dark-eyed Junco
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");

  if (!name || name.trim().length < 2) {
    return NextResponse.json(
      { error: "Name parameter is required (min 2 characters)" },
      { status: 400 }
    );
  }

  const result = await lookupBirdFromWikipedia(name.trim());

  if (!result) {
    return NextResponse.json(
      { error: "Bird not found", name: name.trim() },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
