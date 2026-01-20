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
