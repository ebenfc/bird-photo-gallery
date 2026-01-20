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

export interface BirdLookupResult {
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
 * Takes complete sentences up to approximately 500 characters
 */
function extractDescription(extract: string): string | null {
  if (!extract) return null;

  // Split into sentences (handle common abbreviations)
  const sentences = extract.split(/(?<=[.!?])\s+(?=[A-Z])/);
  if (sentences.length === 0) return null;

  // Build description from complete sentences
  let desc = "";
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    // Stop if adding this sentence would exceed ~500 chars
    if (desc.length + trimmedSentence.length > 500 && desc.length > 0) {
      break;
    }
    desc += (desc ? " " : "") + trimmedSentence;
    // Ensure sentence ends with punctuation
    if (!/[.!?]$/.test(desc)) {
      desc += ".";
    }
    // Take at least 2 sentences if they're short, otherwise stop after reasonable length
    if (desc.length >= 150) {
      break;
    }
  }

  return desc.trim() || null;
}

/**
 * Look up a bird species by common name using Wikipedia API
 */
export async function lookupBirdFromWikipedia(
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
