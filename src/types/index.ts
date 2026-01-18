export type Rarity = "common" | "uncommon" | "rare";

export interface Species {
  id: number;
  commonName: string;
  scientificName: string | null;
  description: string | null;
  rarity: Rarity;
  createdAt: string;
  photoCount?: number;
  latestPhoto?: {
    id: number;
    thumbnailFilename: string;
  } | null;
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
