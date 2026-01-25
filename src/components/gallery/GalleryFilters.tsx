"use client";

import { Species, Rarity } from "@/types";
import Select from "@/components/ui/Select";

interface GalleryFiltersProps {
  species: Species[];
  selectedSpecies: number | null;
  showFavoritesOnly: boolean;
  selectedRarities: Rarity[];
  sortOption: string;
  onSpeciesChange: (id: number | null) => void;
  onFavoritesChange: (value: boolean) => void;
  onRarityChange: (rarities: Rarity[]) => void;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: "recent_upload", label: "Most Recent" },
  { value: "oldest_upload", label: "Oldest First" },
];

const rarityOptions: {
  value: Rarity;
  label: string;
}[] = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
];

export default function GalleryFilters({
  species,
  selectedSpecies,
  showFavoritesOnly,
  selectedRarities,
  sortOption,
  onSpeciesChange,
  onFavoritesChange,
  onRarityChange,
  onSortChange,
}: GalleryFiltersProps) {
  const hasFilters = selectedSpecies !== null || showFavoritesOnly || selectedRarities.length > 0;

  // Single-select: clicking a rarity toggles it (deselects if already selected, or selects it exclusively)
  const selectRarity = (rarity: Rarity) => {
    if (selectedRarities.includes(rarity)) {
      onRarityChange([]);
    } else {
      onRarityChange([rarity]);
    }
  };

  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      {/* Row 1: Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={selectedSpecies?.toString() || ""}
          onChange={(e) =>
            onSpeciesChange(e.target.value ? parseInt(e.target.value) : null)
          }
          className="w-full sm:w-48"
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
          className="w-full sm:w-48"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Row 2: Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Favorites button */}
        <button
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold
            rounded-[var(--radius-full)] border-2
            shadow-[var(--shadow-xs)]
            transition-all duration-[var(--timing-fast)]
            active:scale-95
            ${showFavoritesOnly
              ? "bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)] text-white border-[var(--forest-600)] shadow-[var(--shadow-forest)]"
              : "bg-white text-[var(--mist-500)] border-[var(--mist-200)] hover:border-[var(--moss-300)] hover:text-[var(--forest-700)] hover:shadow-[var(--shadow-sm)]"
            }`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-[var(--timing-fast)]
              ${showFavoritesOnly ? "scale-110" : ""}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={showFavoritesOnly ? 0 : 2}
            fill={showFavoritesOnly ? "currentColor" : "none"}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="hidden xs:inline">Favorites</span>
        </button>

        {/* Rarity filter pills - single select with unified teal/emerald palette */}
        {rarityOptions.map((opt) => {
          const isSelected = selectedRarities.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => selectRarity(opt.value)}
              className={`px-4 py-2 text-sm font-semibold
                rounded-[var(--radius-full)] border-2
                shadow-[var(--shadow-xs)]
                transition-all duration-[var(--timing-fast)]
                active:scale-95
                ${isSelected
                  ? "bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)] text-white border-[var(--moss-600)] shadow-[var(--shadow-moss)]"
                  : "bg-white text-[var(--mist-500)] border-[var(--mist-200)] hover:border-[var(--moss-300)] hover:text-[var(--forest-700)] hover:shadow-[var(--shadow-sm)]"
                }`}
            >
              {opt.label}
            </button>
          );
        })}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => {
              onSpeciesChange(null);
              onFavoritesChange(false);
              onRarityChange([]);
            }}
            className="px-4 py-2 text-sm font-semibold text-[var(--mist-500)]
              hover:text-[var(--forest-700)] hover:bg-[var(--mist-50)]
              rounded-[var(--radius-full)]
              transition-all duration-[var(--timing-fast)]
              active:scale-95"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
