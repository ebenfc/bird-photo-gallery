// eBird CSV Parser
// Parses the "My eBird Data" CSV export (tab-delimited, one row per observation)
// Extracts unique species with their earliest observation date

const MAX_UNIQUE_SPECIES = 5000;

export interface ParsedSpecies {
  commonName: string;
  scientificName: string | null;
  firstObservedDate: string | null; // ISO date string (YYYY-MM-DD)
}

export interface ParsedEbirdData {
  species: ParsedSpecies[];
  totalObservations: number;
  parseErrors: string[];
}

/**
 * Parse an eBird "My eBird Data" CSV export.
 * The file is tab-delimited with one row per observation.
 * Extracts unique species by common name, keeping the earliest observation date.
 */
export function parseEbirdCsv(csvText: string): ParsedEbirdData {
  const errors: string[] = [];

  // Normalize line endings and split
  const lines = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  if (lines.length < 2) {
    return { species: [], totalObservations: 0, parseErrors: ["File is empty or has no data rows"] };
  }

  // Parse header row (tab-delimited)
  const headerLine = lines[0] ?? "";
  const headers = headerLine.split("\t").map((h) => h.trim());

  // Find required column indices
  const commonNameIdx = headers.findIndex(
    (h) => h.toLowerCase() === "common name"
  );
  const scientificNameIdx = headers.findIndex(
    (h) => h.toLowerCase() === "scientific name"
  );
  const dateIdx = headers.findIndex(
    (h) => h.toLowerCase() === "date"
  );

  if (commonNameIdx === -1) {
    return {
      species: [],
      totalObservations: 0,
      parseErrors: ["Could not find 'Common Name' column. Is this an eBird data export?"],
    };
  }

  // Track unique species: commonName (lowercase) → ParsedSpecies
  const speciesMap = new Map<string, ParsedSpecies>();
  let totalObservations = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = (lines[i] ?? "").trim();
    if (!line) continue;

    const fields = line.split("\t");
    const commonName = fields[commonNameIdx]?.trim();
    if (!commonName) continue;

    totalObservations++;

    const scientificName =
      scientificNameIdx !== -1 ? fields[scientificNameIdx]?.trim() || null : null;
    const dateStr =
      dateIdx !== -1 ? fields[dateIdx]?.trim() || null : null;

    // Parse date (eBird uses YYYY-MM-DD format)
    let observedDate: string | null = null;
    if (dateStr) {
      // Validate date format loosely — accept YYYY-MM-DD
      const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateMatch) {
        observedDate = dateStr;
      }
    }

    const key = commonName.toLowerCase();
    const existing = speciesMap.get(key);

    if (!existing) {
      if (speciesMap.size >= MAX_UNIQUE_SPECIES) {
        errors.push(`Stopped at ${MAX_UNIQUE_SPECIES} unique species (file may contain more)`);
        break;
      }
      speciesMap.set(key, {
        commonName,
        scientificName,
        firstObservedDate: observedDate,
      });
    } else {
      // Keep the earliest observation date
      if (observedDate && (!existing.firstObservedDate || observedDate < existing.firstObservedDate)) {
        existing.firstObservedDate = observedDate;
      }
      // Backfill scientific name if missing
      if (!existing.scientificName && scientificName) {
        existing.scientificName = scientificName;
      }
    }
  }

  return {
    species: Array.from(speciesMap.values()),
    totalObservations,
    parseErrors: errors,
  };
}
