// Haikubox API Client
// Fetches bird detection data from Haikubox audio monitoring device

// Configuration
const HAIKUBOX_BASE_URL = "https://api.haikubox.com";
const HAIKUBOX_SERIAL = process.env.HAIKUBOX_SERIAL || "28372F870638";

// Types for Haikubox API responses
export interface HaikuboxYearlySpecies {
  species: string;
  count: number;
}

export interface HaikuboxDailySpecies {
  species: string;
  count: number;
}

export interface HaikuboxRecentDetection {
  species: string;
  timestamp: string;
  confidence?: number;
}

/**
 * Fetch yearly species counts (top 75 species for the year)
 */
export async function fetchYearlyDetections(
  year: number
): Promise<HaikuboxYearlySpecies[]> {
  const url = `${HAIKUBOX_BASE_URL}/haikubox/${HAIKUBOX_SERIAL}/yearly-count?year=${year}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    });

    if (!response.ok) {
      throw new Error(`Haikubox API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch yearly detections:", error);
    return [];
  }
}

/**
 * Fetch daily species counts for a specific date
 */
export async function fetchDailyDetections(
  date: string
): Promise<HaikuboxDailySpecies[]> {
  const url = `${HAIKUBOX_BASE_URL}/haikubox/${HAIKUBOX_SERIAL}/daily-count?date=${date}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Haikubox API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch daily detections:", error);
    return [];
  }
}

/**
 * Fetch recent detections (last N hours)
 */
export async function fetchRecentDetections(
  hours: number = 8
): Promise<HaikuboxRecentDetection[]> {
  const url = `${HAIKUBOX_BASE_URL}/haikubox/${HAIKUBOX_SERIAL}/detections?hours=${hours}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`Haikubox API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch recent detections:", error);
    return [];
  }
}

/**
 * Normalize common name for case-insensitive matching
 * Converts to lowercase and trims whitespace
 */
export function normalizeCommonName(name: string): string {
  return name.toLowerCase().trim();
}
