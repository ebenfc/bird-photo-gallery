"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Species, Rarity } from "@/types";
import SpeciesCard from "@/components/species/SpeciesCard";

type SpeciesSortOption = "alpha" | "photo_count" | "recent_added" | "recent_taken";

export default function PublicSpeciesPage() {
  const params = useParams();
  const username = params.username as string;

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SpeciesSortOption>("alpha");
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchSpecies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("sort", sortOption);

      const res = await fetch(`/api/public/gallery/${username}/species?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSpeciesList(data.species);
      }
    } catch (error) {
      console.error("Failed to fetch species:", error);
    } finally {
      setLoading(false);
    }
  }, [username, sortOption]);

  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  // Filter species by rarity (client-side)
  const filteredSpecies = selectedRarities.length > 0
    ? speciesList.filter((s) => selectedRarities.includes(s.rarity))
    : speciesList;

  // Single-select rarity toggle (matching authenticated view)
  const toggleRarity = (rarity: Rarity) => {
    if (selectedRarities.includes(rarity)) {
      setSelectedRarities([]);
    } else {
      setSelectedRarities([rarity]);
    }
  };

  const rarityOptions: { value: Rarity; label: string }[] = [
    { value: "common", label: "Common" },
    { value: "uncommon", label: "Uncommon" },
    { value: "rare", label: "Rare" },
  ];

  const activeFilterCount = selectedRarities.length;

  return (
    <div className="pb-16 md:pb-0">
      {/* Desktop header */}
      <div className="hidden sm:flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Species
          </h2>
          <p className="text-[var(--mist-600)] mt-1">
            {speciesList.length} species in this gallery
          </p>
        </div>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SpeciesSortOption)}
          className="px-3 py-2 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-md)]
            text-sm text-[var(--forest-700)] focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)]"
        >
          <option value="alpha">A-Z</option>
          <option value="photo_count">Most Photos</option>
          <option value="recent_added">Recently Added</option>
          <option value="recent_taken">Recently Photographed</option>
        </select>
      </div>

      {/* Mobile header - compact with filter toggle */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Species
          </h2>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold
              rounded-[var(--radius-lg)] border
              transition-all duration-[var(--timing-fast)] active:scale-95
              ${showMobileFilters || activeFilterCount > 0
                ? "bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)] text-white border-[var(--forest-600)]"
                : "bg-[var(--card-bg)] text-[var(--forest-700)] border-[var(--mist-200)] hover:border-[var(--moss-300)]"
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-[var(--card-bg)]/20">
                {activeFilterCount}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showMobileFilters ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-[var(--mist-500)]">
          {speciesList.length} species in this gallery
        </p>
      </div>

      {/* Mobile filters - collapsible */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-out
        ${showMobileFilters ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
        <div className="bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-sm)] border border-[var(--border)]">
          {/* Sort dropdown inside mobile filters */}
          <div className="mb-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SpeciesSortOption)}
              className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-md)]
                text-sm text-[var(--forest-700)] focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)]"
            >
              <option value="alpha">A-Z</option>
              <option value="photo_count">Most Photos</option>
              <option value="recent_added">Recently Added</option>
              <option value="recent_taken">Recently Photographed</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {rarityOptions.map((opt) => {
              const isSelected = selectedRarities.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleRarity(opt.value)}
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
            {selectedRarities.length > 0 && (
              <button
                onClick={() => setSelectedRarities([])}
                className="px-4 py-2 text-sm font-semibold text-[var(--mist-500)]
                  hover:text-[var(--forest-700)] hover:bg-[var(--mist-50)]
                  rounded-[var(--radius-full)]
                  transition-all duration-[var(--timing-fast)]
                  active:scale-95"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Rarity Filters - always visible */}
      <div className="hidden sm:flex flex-wrap items-center gap-2 mb-6">
        {rarityOptions.map((opt) => {
          const isSelected = selectedRarities.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleRarity(opt.value)}
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
        {selectedRarities.length > 0 && (
          <button
            onClick={() => setSelectedRarities([])}
            className="px-4 py-2 text-sm font-semibold text-[var(--mist-500)]
              hover:text-[var(--forest-700)] hover:bg-[var(--mist-50)]
              rounded-[var(--radius-full)]
              transition-all duration-[var(--timing-fast)]
              active:scale-95"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--card-bg)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-[var(--surface-moss)] to-[var(--mist-50)] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-[var(--mist-200)] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[var(--mist-100)] rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-[var(--mist-100)] rounded-full animate-pulse" />
                  <div className="h-6 w-20 bg-[var(--mist-100)] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Species Grid */}
      {!loading && filteredSpecies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecies.map((species, index) => (
            <SpeciesCard
              key={species.id}
              species={species}
              linkPrefix={`/u/${username}/species`}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSpecies.length === 0 && (
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-label)] mb-2">
            No species found
          </h3>
          <p className="text-[var(--mist-500)] mb-6 max-w-sm mx-auto">
            {selectedRarities.length > 0
              ? "No species match the selected rarity filter"
              : "This gallery doesn't have any species yet"}
          </p>
          {selectedRarities.length > 0 && (
            <button
              onClick={() => setSelectedRarities([])}
              className="px-4 py-2 text-sm font-semibold text-[var(--forest-700)]
                bg-[var(--card-bg)] border border-[var(--mist-200)] rounded-[var(--radius-full)]
                hover:border-[var(--moss-300)] transition-all"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
