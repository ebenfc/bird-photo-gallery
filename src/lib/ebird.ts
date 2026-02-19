// eBird API Client
// Fetches taxonomy data from eBird API 2.0 for species code enrichment and life list matching

import { getOrFetchDeduped, cacheKeys } from "./cache";

// Configuration
const EBIRD_API_BASE = "https://api.ebird.org/v2";
const TAXONOMY_CACHE_TTL = 86400; // 24 hours

// Types for eBird API responses
export interface EbirdTaxonEntry {
  speciesCode: string;  // e.g., "norcar"
  comName: string;      // e.g., "Northern Cardinal"
  sciName: string;      // e.g., "Cardinalis cardinalis"
  category: string;     // e.g., "species", "issf", "slash"
  familyCode?: string;
  order?: string;
}

// Internal lookup maps (built lazily from taxonomy)
let commonNameMap: Map<string, EbirdTaxonEntry> | null = null;
let speciesCodeMap: Map<string, EbirdTaxonEntry> | null = null;

// Extend cache keys
const ebirdCacheKeys = {
  taxonomy: () => "ebird:taxonomy",
};

// Register the cache key pattern
Object.assign(cacheKeys, { ebirdTaxonomy: ebirdCacheKeys.taxonomy });

/**
 * Fetch the full eBird taxonomy (~16,800 species).
 * Cached for 24 hours with thundering-herd protection.
 * Only includes species-level entries (filters out hybrids, slashes, etc.).
 */
export async function fetchEbirdTaxonomy(): Promise<EbirdTaxonEntry[]> {
  const apiKey = process.env.EBIRD_API_KEY;
  if (!apiKey) {
    console.error("EBIRD_API_KEY not set — eBird taxonomy unavailable");
    return [];
  }

  return getOrFetchDeduped<EbirdTaxonEntry[]>(
    ebirdCacheKeys.taxonomy(),
    async () => {
      const url = `${EBIRD_API_BASE}/ref/taxonomy/ebird?fmt=json&cat=species`;
      const res = await fetch(url, {
        headers: { "x-ebirdapitoken": apiKey },
        next: { revalidate: TAXONOMY_CACHE_TTL },
      });

      if (!res.ok) {
        throw new Error(`eBird taxonomy fetch failed: ${res.status} ${res.statusText}`);
      }

      const data: EbirdTaxonEntry[] = await res.json();
      // Reset lookup maps so they're rebuilt from fresh data
      commonNameMap = null;
      speciesCodeMap = null;
      return data;
    },
    TAXONOMY_CACHE_TTL
  );
}

/**
 * Build (or return cached) lookup map: lowercased common name → taxonomy entry.
 */
async function getCommonNameMap(): Promise<Map<string, EbirdTaxonEntry>> {
  if (commonNameMap) return commonNameMap;

  const taxonomy = await fetchEbirdTaxonomy();
  commonNameMap = new Map();
  for (const entry of taxonomy) {
    commonNameMap.set(entry.comName.toLowerCase(), entry);
  }
  return commonNameMap;
}

/**
 * Build (or return cached) lookup map: species code → taxonomy entry.
 */
async function getSpeciesCodeMap(): Promise<Map<string, EbirdTaxonEntry>> {
  if (speciesCodeMap) return speciesCodeMap;

  const taxonomy = await fetchEbirdTaxonomy();
  speciesCodeMap = new Map();
  for (const entry of taxonomy) {
    speciesCodeMap.set(entry.speciesCode, entry);
  }
  return speciesCodeMap;
}

/**
 * Look up eBird species code by common name (case-insensitive).
 * Returns the species code or null if not found.
 */
export async function lookupSpeciesCode(commonName: string): Promise<string | null> {
  try {
    const map = await getCommonNameMap();
    const entry = map.get(commonName.toLowerCase());
    return entry?.speciesCode ?? null;
  } catch (error) {
    console.error("eBird species code lookup failed:", error);
    return null;
  }
}

/**
 * Look up species info by eBird species code.
 * Returns taxonomy entry or null if not found.
 */
export async function lookupSpeciesByCode(speciesCode: string): Promise<EbirdTaxonEntry | null> {
  try {
    const map = await getSpeciesCodeMap();
    return map.get(speciesCode) ?? null;
  } catch (error) {
    console.error("eBird species lookup by code failed:", error);
    return null;
  }
}

/**
 * Batch lookup: map an array of common names to their eBird species codes.
 * Returns a Map of commonName → speciesCode (only for matches).
 * More efficient than individual lookups when processing many species.
 */
export async function batchLookupSpeciesCodes(
  commonNames: string[]
): Promise<Map<string, string>> {
  try {
    const map = await getCommonNameMap();
    const result = new Map<string, string>();

    for (const name of commonNames) {
      const entry = map.get(name.toLowerCase());
      if (entry) {
        result.set(name, entry.speciesCode);
      }
    }

    return result;
  } catch (error) {
    console.error("eBird batch lookup failed:", error);
    return new Map();
  }
}
