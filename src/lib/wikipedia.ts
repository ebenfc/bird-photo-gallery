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
  _title: string,
  extract: string
): string | null {
  // Pattern 1: Look for "(Genus species)" pattern at the start of extract
  // E.g., "The dark-eyed junco (Junco hyemalis) is a..."
  const parenMatch = extract.match(/\(([A-Z][a-z]+ [a-z]+(?:\s+[a-z]+)?)\)/);
  if (parenMatch?.[1]) {
    return parenMatch[1];
  }

  // Pattern 2: Check if title itself might contain scientific name
  // E.g., "American Robin" - title alone doesn't have it
  // But extract might say "Turdus migratorius"
  const scientificPattern =
    /([A-Z][a-z]+\s[a-z]+(?:\s[a-z]+)?)\s+is\s+a\s+(?:species|bird)/i;
  const extractMatch = extract.match(scientificPattern);
  const candidate = extractMatch?.[1];
  if (candidate) {
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
 * Normalize apostrophes to standard ASCII apostrophe
 * Converts Unicode right single quotation mark (') to ASCII apostrophe (')
 */
function normalizeApostrophes(name: string): string {
  return name.replace(/[\u2019\u2018\u0060\u00B4]/g, "'");
}

/**
 * Convert to Wikipedia-style title case (first word capitalized, rest lowercase except proper nouns)
 * E.g., "Red-Breasted Nuthatch" -> "Red-breasted nuthatch"
 */
function toWikipediaCase(name: string): string {
  const words = name.split(/(\s+|-)/);
  return words
    .map((word, index) => {
      if (word === " " || word === "-") return word;
      if (index === 0) {
        // First word: capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      // Other words: lowercase (Wikipedia uses sentence case for bird names)
      return word.toLowerCase();
    })
    .join("");
}

interface WikipediaPage {
  pageid?: number;
  title?: string;
  extract?: string;
}

/**
 * Try to fetch from Wikipedia with a specific title
 */
async function tryWikipediaFetch(
  title: string
): Promise<{ page: WikipediaPage; found: boolean }> {
  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("prop", "extracts|pageprops");
  searchUrl.searchParams.set("exintro", "true");
  searchUrl.searchParams.set("explaintext", "true");
  searchUrl.searchParams.set("exsentences", "3");
  searchUrl.searchParams.set("titles", title);
  searchUrl.searchParams.set("redirects", "1");
  searchUrl.searchParams.set("origin", "*");

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    return { page: {}, found: false };
  }

  const data: WikipediaSearchResult = await response.json();
  if (!data.query?.pages) {
    return { page: {}, found: false };
  }

  const pages = Object.values(data.query.pages);
  const page = pages[0];

  if (!page || page.pageid === undefined || page.pageid === -1) {
    return { page: {}, found: false };
  }

  return { page, found: true };
}

/**
 * Look up a bird species by common name using Wikipedia API
 * Tries multiple casing variations to handle Wikipedia's sentence case titles
 */
export async function lookupBirdFromWikipedia(
  commonName: string
): Promise<BirdLookupResult | null> {
  try {
    // Normalize apostrophes to standard ASCII (Unicode ' -> ASCII ')
    const normalizedName = normalizeApostrophes(commonName);

    // Generate title variations to try
    const wikiCase = toWikipediaCase(normalizedName);
    const titlesToTry = [
      normalizedName,                // With normalized apostrophes
      wikiCase,                      // Wiki case: "Red-breasted nuthatch"
      `${normalizedName} (bird)`,    // With suffix
      `${wikiCase} (bird)`,          // Wiki case with suffix
    ];

    // Remove duplicates
    const uniqueTitles = [...new Set(titlesToTry)];

    for (const title of uniqueTitles) {
      const { page, found } = await tryWikipediaFetch(title);

      if (found && page.extract) {
        return {
          commonName: commonName,
          scientificName: extractScientificName(page.title || commonName, page.extract),
          description: extractDescription(page.extract),
          source: "wikipedia",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Wikipedia lookup error:", error);
    return null;
  }
}
