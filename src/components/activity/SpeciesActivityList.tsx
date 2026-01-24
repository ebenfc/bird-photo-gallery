"use client";

import { useState, useMemo } from "react";
import { SpeciesActivityData, Rarity, SpeciesActivitySort } from "@/types";
import SpeciesActivityFilters from "./SpeciesActivityFilters";
import SpeciesActivityRow from "./SpeciesActivityRow";

interface SpeciesActivityListProps {
  data: SpeciesActivityData[];
  loading?: boolean;
}

export default function SpeciesActivityList({
  data,
  loading = false,
}: SpeciesActivityListProps) {
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");
  const [photoFilter, setPhotoFilter] = useState<
    "all" | "photographed" | "not-yet"
  >("all");
  const [sortOption, setSortOption] =
    useState<SpeciesActivitySort>("count-desc");

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply rarity filter
    if (rarityFilter !== "all") {
      result = result.filter((item) => {
        // Handle null rarity by defaulting to "common"
        const itemRarity = item.rarity || "common";
        return itemRarity === rarityFilter;
      });
    }

    // Apply photo status filter
    if (photoFilter === "photographed") {
      result = result.filter((item) => item.hasPhoto);
    } else if (photoFilter === "not-yet") {
      result = result.filter((item) => !item.hasPhoto);
    }

    // Apply sorting
    switch (sortOption) {
      case "count-desc":
        result.sort((a, b) => b.yearlyCount - a.yearlyCount);
        break;
      case "count-asc":
        result.sort((a, b) => a.yearlyCount - b.yearlyCount);
        break;
      case "name-asc":
        result.sort((a, b) => a.commonName.localeCompare(b.commonName));
        break;
      case "name-desc":
        result.sort((a, b) => b.commonName.localeCompare(a.commonName));
        break;
      case "last-heard-desc":
        result.sort((a, b) => {
          if (!a.lastHeardAt) return 1;
          if (!b.lastHeardAt) return -1;
          return (
            new Date(b.lastHeardAt).getTime() -
            new Date(a.lastHeardAt).getTime()
          );
        });
        break;
      case "last-heard-asc":
        result.sort((a, b) => {
          if (!a.lastHeardAt) return 1;
          if (!b.lastHeardAt) return -1;
          return (
            new Date(a.lastHeardAt).getTime() -
            new Date(b.lastHeardAt).getTime()
          );
        });
        break;
    }

    return result;
  }, [data, rarityFilter, photoFilter, sortOption]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  // Empty state - no data at all
  if (data.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <svg
          className="w-16 h-16 mx-auto text-[var(--mist-400)] mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <h3 className="text-lg font-semibold text-[var(--forest-800)] mb-2">
          No Bird Detections Yet
        </h3>
        <p className="text-[var(--mist-600)] max-w-md mx-auto">
          No bird activity has been recorded yet. Sync your Haikubox to see
          detected species here.
        </p>
      </div>
    );
  }

  // Empty state - filtered to nothing
  if (filteredAndSortedData.length === 0) {
    return (
      <div className="space-y-6">
        <SpeciesActivityFilters
          rarityFilter={rarityFilter}
          photoFilter={photoFilter}
          sortOption={sortOption}
          resultCount={filteredAndSortedData.length}
          totalCount={data.length}
          onRarityChange={setRarityFilter}
          onPhotoFilterChange={setPhotoFilter}
          onSortChange={setSortOption}
        />
        <div className="text-center py-12 px-4">
          <svg
            className="w-16 h-16 mx-auto text-[var(--mist-400)] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--forest-800)] mb-2">
            No Species Match These Filters
          </h3>
          <p className="text-[var(--mist-600)] max-w-md mx-auto">
            Try adjusting your filter selection or clearing filters to see more
            results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <SpeciesActivityFilters
        rarityFilter={rarityFilter}
        photoFilter={photoFilter}
        sortOption={sortOption}
        resultCount={filteredAndSortedData.length}
        totalCount={data.length}
        onRarityChange={setRarityFilter}
        onPhotoFilterChange={setPhotoFilter}
        onSortChange={setSortOption}
      />

      {/* Species List */}
      <div className="space-y-2">
        {filteredAndSortedData.map((species) => (
          <SpeciesActivityRow key={species.commonName} data={species} />
        ))}
      </div>
    </div>
  );
}
