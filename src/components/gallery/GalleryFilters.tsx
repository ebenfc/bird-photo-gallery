"use client";

import { Species } from "@/types";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface GalleryFiltersProps {
  species: Species[];
  selectedSpecies: number | null;
  showFavoritesOnly: boolean;
  sortOption: string;
  onSpeciesChange: (id: number | null) => void;
  onFavoritesChange: (value: boolean) => void;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: "recent_upload", label: "Most Recent" },
  { value: "oldest_upload", label: "Oldest First" },
  { value: "species_alpha", label: "Species A-Z" },
  { value: "recent_taken", label: "Recently Photographed" },
];

export default function GalleryFilters({
  species,
  selectedSpecies,
  showFavoritesOnly,
  sortOption,
  onSpeciesChange,
  onFavoritesChange,
  onSortChange,
}: GalleryFiltersProps) {
  const hasFilters = selectedSpecies !== null || showFavoritesOnly;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Select
        value={selectedSpecies?.toString() || ""}
        onChange={(e) =>
          onSpeciesChange(e.target.value ? parseInt(e.target.value) : null)
        }
        className="w-48"
      >
        <option value="">All Species</option>
        {species.map((s) => (
          <option key={s.id} value={s.id}>
            {s.commonName} ({s.photoCount || 0})
          </option>
        ))}
      </Select>

      <Select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-48"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </Select>

      <Button
        variant={showFavoritesOnly ? "primary" : "secondary"}
        onClick={() => onFavoritesChange(!showFavoritesOnly)}
        size="md"
      >
        <svg
          className={`w-4 h-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={showFavoritesOnly ? 0 : 2}
          fill={showFavoritesOnly ? "currentColor" : "none"}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        Favorites
      </Button>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            onSpeciesChange(null);
            onFavoritesChange(false);
          }}
          size="md"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
