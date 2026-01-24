export type Rarity = "common" | "uncommon" | "rare";

export interface Species {
  id: number;
  commonName: string;
  scientificName: string | null;
  description: string | null;
  rarity: Rarity;
  createdAt: string;
  photoCount?: number;
  coverPhotoId?: number | null;
  coverPhoto?: {
    id: number;
    thumbnailUrl: string;
  } | null;
  latestPhoto?: {
    id: number;
    thumbnailUrl: string;
  } | null;
  // Haikubox detection data (populated when available)
  haikuboxYearlyCount?: number | null;
  haikuboxLastHeard?: string | null;
}

export interface Photo {
  id: number;
  filename: string;
  thumbnailFilename: string;
  thumbnailUrl: string;
  originalUrl: string;
  uploadDate: string;
  originalDateTaken: string | null;
  dateTakenSource: "exif" | "manual";
  isFavorite: boolean;
  notes: string | null;
  species: {
    id: number;
    commonName: string;
    scientificName: string | null;
    description?: string | null;
    rarity: Rarity;
  } | null;
}

export interface PhotosResponse {
  photos: Photo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SpeciesResponse {
  species: Species[];
}

// Haikubox types
export interface HaikuboxDetection {
  id: number;
  speciesCommonName: string;
  yearlyCount: number;
  lastHeardAt: string | null;
  dataYear: number;
  matchedSpeciesId: number | null;
  matchedSpeciesName: string | null;
}

export interface HaikuboxDetectionsResponse {
  detections: HaikuboxDetection[];
}

export interface PropertyStats {
  totalHeard: number;
  totalPhotographed: number;
  heardAndPhotographed: number;
  heardNotPhotographed: Array<{
    commonName: string;
    yearlyCount: number;
    lastHeardAt: string | null;
  }>;
  recentlyHeard: Array<{
    commonName: string;
    lastHeardAt: string | null;
    yearlyCount: number;
    hasPhoto: boolean;
  }>;
  year: number;
}

// Activity Timeline types
export interface HourlyActivity {
  hour: number;
  count: number;
  percentage: number;
}

export interface ActivityPattern {
  speciesName: string;
  totalDetections: number;
  hourlyBreakdown: HourlyActivity[];
  peakHours: number[];
  dataDateRange: { start: string; end: string } | null;
}

export interface ActiveSpecies {
  speciesName: string;
  activityScore: number;
  recentCount: number;
}

export interface ActivityPatternResponse {
  pattern: ActivityPattern;
}

export interface ActiveNowResponse {
  activeSpecies: ActiveSpecies[];
  currentHour: number;
  timestamp: string;
}

export interface HeatmapResponse {
  heatmap: Array<{
    speciesName: string;
    hourlyData: number[];
  }>;
  daysAnalyzed: number;
  generatedAt: string;
}

// Photo Suggestions types
export interface Suggestion {
  id: number;
  commonName: string;
  scientificName: string | null;
  rarity: Rarity;
  score: number;
  reason: string;
  yearlyCount: number;
  photoCount: number;
  lastHeard: Date | null;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
  topSuggestion: Suggestion | null;
  generatedAt: string;
}

// Bubble Chart types
export interface BubbleChartBird {
  commonName: string;
  yearlyCount: number;
  hasPhoto: boolean;
  lastHeardAt: string | null;
}

export interface BubblePosition {
  x: number;
  y: number;
  r: number; // radius in pixels
  bird: BubbleChartBird;
}

export interface TooltipState {
  visible: boolean;
  bird: BubbleChartBird | null;
  position: { x: number; y: number };
}
