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
  // Advanced search filters (owner-only — not shown on public galleries)
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  onSearchChange?: (query: string) => void;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
  onClearAll?: () => void;
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
  searchQuery,
  dateFrom,
  dateTo,
  onSpeciesChange,
  onFavoritesChange,
  onRarityChange,
  onSortChange,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onClearAll,
}: GalleryFiltersProps) {
  const showAdvancedSearch = onSearchChange !== undefined;
  const hasFilters = selectedSpecies !== null || showFavoritesOnly || selectedRarities.length > 0
    || (searchQuery && searchQuery.length > 0) || (dateFrom && dateFrom.length > 0) || (dateTo && dateTo.length > 0);

  // Single-select: clicking a rarity toggles it (deselects if already selected, or selects it exclusively)
  const selectRarity = (rarity: Rarity) => {
    if (selectedRarities.includes(rarity)) {
      onRarityChange([]);
    } else {
      onRarityChange([rarity]);
    }
  };

  const dateInputClass = `
    block w-full min-w-0 px-3 py-3
    bg-[var(--card-bg)] text-[var(--foreground)]
    border-2 border-[var(--mist-200)] rounded-[var(--radius-lg)]
    shadow-[var(--shadow-sm)]
    transition-all duration-[var(--timing-fast)]
    focus:outline-none focus:border-[var(--moss-400)]
    focus:shadow-[var(--shadow-moss)]
    hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-md)]
    text-base font-medium
  `;

  return (
    <div className="space-y-4 sm:mb-6 animate-fade-in">
      {/* Search bar (owner-only) */}
      {showAdvancedSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-[var(--mist-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange!(e.target.value)}
            placeholder="Search by species name..."
            aria-label="Search photos by species name"
            className={`
              block w-full pl-11 pr-10 py-3
              bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--mist-400)]
              border-2 border-[var(--mist-200)] rounded-[var(--radius-lg)]
              shadow-[var(--shadow-sm)]
              transition-all duration-[var(--timing-fast)]
              focus:outline-none focus:border-[var(--moss-400)]
              focus:shadow-[var(--shadow-moss)]
              hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-md)]
              text-base font-medium
            `}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange!("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3
                text-[var(--mist-400)] hover:text-[var(--forest-700)]
                transition-colors duration-[var(--timing-fast)]"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

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

        {/* Date range inputs (owner-only) */}
        {showAdvancedSearch && (
          <div className="flex items-end gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-0 sm:w-40 sm:flex-none">
              <label htmlFor="dateFrom" className="block text-xs font-semibold text-[var(--mist-500)] mb-1 sm:sr-only">
                From
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom || ""}
                onChange={(e) => onDateFromChange!(e.target.value)}
                max={dateTo || undefined}
                className={dateInputClass}
              />
            </div>
            <span className="text-[var(--mist-400)] text-sm font-medium shrink-0 pb-3">to</span>
            <div className="relative flex-1 min-w-0 sm:w-40 sm:flex-none">
              <label htmlFor="dateTo" className="block text-xs font-semibold text-[var(--mist-500)] mb-1 sm:sr-only">
                To
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo || ""}
                onChange={(e) => onDateToChange!(e.target.value)}
                min={dateFrom || undefined}
                className={dateInputClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Favorites button */}
        <button
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
          aria-pressed={showFavoritesOnly}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold
            rounded-[var(--radius-full)] border-2
            shadow-[var(--shadow-xs)]
            transition-all duration-[var(--timing-fast)]
            active:scale-95
            ${showFavoritesOnly
              ? "bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)] text-white border-[var(--forest-600)] shadow-[var(--shadow-forest)]"
              : "bg-[var(--card-bg)] text-[var(--mist-500)] border-[var(--mist-200)] hover:border-[var(--moss-300)] hover:text-[var(--forest-700)] hover:shadow-[var(--shadow-sm)]"
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
              aria-pressed={isSelected}
              className={`px-4 py-2 text-sm font-semibold
                rounded-[var(--radius-full)] border-2
                shadow-[var(--shadow-xs)]
                transition-all duration-[var(--timing-fast)]
                active:scale-95
                ${isSelected
                  ? "bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)] text-white border-[var(--moss-600)] shadow-[var(--shadow-moss)]"
                  : "bg-[var(--card-bg)] text-[var(--mist-500)] border-[var(--mist-200)] hover:border-[var(--moss-300)] hover:text-[var(--forest-700)] hover:shadow-[var(--shadow-sm)]"
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
              if (onClearAll) {
                onClearAll();
              } else {
                onSpeciesChange(null);
                onFavoritesChange(false);
                onRarityChange([]);
              }
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
