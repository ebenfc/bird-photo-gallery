"use client";

import { Rarity, SpeciesActivitySort } from "@/types";
import Select from "@/components/ui/Select";

interface SpeciesActivityFiltersProps {
  rarityFilter: Rarity | "all";
  photoFilter: "all" | "photographed" | "not-yet";
  sortOption: SpeciesActivitySort;
  resultCount: number;
  totalCount: number;
  onRarityChange: (rarity: Rarity | "all") => void;
  onPhotoFilterChange: (filter: "all" | "photographed" | "not-yet") => void;
  onSortChange: (sort: SpeciesActivitySort) => void;
}

const sortOptions: { value: SpeciesActivitySort; label: string }[] = [
  { value: "count-desc", label: "Count (Highest First)" },
  { value: "count-asc", label: "Count (Lowest First)" },
  { value: "name-asc", label: "Species Name (A-Z)" },
  { value: "name-desc", label: "Species Name (Z-A)" },
  { value: "last-heard-desc", label: "Last Heard (Most Recent)" },
  { value: "last-heard-asc", label: "Last Heard (Oldest)" },
];

const rarityOptions: { value: Rarity | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
];

const photoFilterOptions: {
  value: "all" | "photographed" | "not-yet";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "photographed", label: "Photographed" },
  { value: "not-yet", label: "Not Yet" },
];

export default function SpeciesActivityFilters({
  rarityFilter,
  photoFilter,
  sortOption,
  resultCount,
  totalCount,
  onRarityChange,
  onPhotoFilterChange,
  onSortChange,
}: SpeciesActivityFiltersProps) {
  const hasFilters = rarityFilter !== "all" || photoFilter !== "all";

  const handleClearFilters = () => {
    onRarityChange("all");
    onPhotoFilterChange("all");
  };

  return (
    <div className="space-y-4 mb-6 animate-fade-in">
      {/* Row 1: Sort dropdown and result count */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SpeciesActivitySort)}
          className="w-full sm:w-64"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </Select>

        {/* Result count */}
        <div
          className="text-sm text-[var(--mist-600)] font-medium"
          aria-live="polite"
        >
          Showing {resultCount} of {totalCount} species
        </div>
      </div>

      {/* Row 2: Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Rarity filter pills */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--mist-600)] mr-1">
            Rarity:
          </span>
          {rarityOptions.map((opt) => {
            const isSelected = rarityFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onRarityChange(opt.value)}
                aria-label={`Filter by ${opt.label} rarity`}
                aria-pressed={isSelected}
                className={`px-4 py-2 text-sm font-semibold
                  rounded-[var(--radius-full)] border-2
                  shadow-[var(--shadow-xs)]
                  transition-all duration-[var(--timing-fast)]
                  active:scale-95
                  ${
                    isSelected
                      ? "bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)] text-white border-[var(--moss-600)] shadow-[var(--shadow-moss)]"
                      : "bg-white text-[var(--mist-500)] border-[var(--mist-200)] hover:border-[var(--moss-300)] hover:text-[var(--forest-700)] hover:shadow-[var(--shadow-sm)]"
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-[var(--mist-200)]" />

        {/* Photo status filter pills */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--mist-600)] mr-1">
            Photo Status:
          </span>
          {photoFilterOptions.map((opt) => {
            const isSelected = photoFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onPhotoFilterChange(opt.value)}
                aria-label={`Filter by ${opt.label} photo status`}
                aria-pressed={isSelected}
                className={`px-4 py-2 text-sm font-semibold
                  rounded-[var(--radius-full)] border-2
                  shadow-[var(--shadow-xs)]
                  transition-all duration-[var(--timing-fast)]
                  active:scale-95
                  ${
                    isSelected
                      ? "bg-gradient-to-b from-[var(--sky-500)] to-[var(--sky-600)] text-white border-[var(--sky-600)] shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
                      : "bg-white text-[var(--mist-500)] border-[var(--mist-200)] hover:border-[var(--sky-300)] hover:text-[var(--sky-700)] hover:shadow-[var(--shadow-sm)]"
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Clear filters button */}
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-semibold text-[var(--mist-500)]
              hover:text-[var(--forest-700)] hover:bg-[var(--mist-50)]
              rounded-[var(--radius-full)]
              transition-all duration-[var(--timing-fast)]
              active:scale-95"
            aria-label="Clear all filters"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
