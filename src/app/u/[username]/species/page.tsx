"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Species, Rarity } from "@/types";
import RarityBadge from "@/components/ui/RarityBadge";

type SpeciesSortOption = "alpha" | "photo_count" | "recent_added" | "recent_taken";

export default function PublicSpeciesPage() {
  const params = useParams();
  const username = params.username as string;

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SpeciesSortOption>("alpha");
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  const toggleRarity = (rarity: Rarity) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  return (
    <div className="pb-16 md:pb-0">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--forest-900)]">
            Species ({filteredSpecies.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SpeciesSortOption)}
            className="px-3 py-2 bg-white border border-[var(--border-light)] rounded-[var(--radius-md)]
              text-sm text-[var(--forest-700)] focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)]"
          >
            <option value="alpha">A-Z</option>
            <option value="photo_count">Most Photos</option>
            <option value="recent_added">Recently Added</option>
            <option value="recent_taken">Recently Photographed</option>
          </select>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden p-2 bg-white border border-[var(--border-light)] rounded-[var(--radius-md)]"
          >
            <svg className="w-5 h-5 text-[var(--mist-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rarity filters */}
      <div className={`mb-6 ${showFilters ? "block" : "hidden sm:block"}`}>
        <div className="flex flex-wrap gap-2">
          {(["common", "uncommon", "rare"] as Rarity[]).map((rarity) => (
            <button
              key={rarity}
              onClick={() => toggleRarity(rarity)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${
                  selectedRarities.includes(rarity)
                    ? rarity === "common"
                      ? "bg-green-100 text-green-800 ring-2 ring-green-300"
                      : rarity === "uncommon"
                      ? "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300"
                      : "bg-purple-100 text-purple-800 ring-2 ring-purple-300"
                    : "bg-[var(--mist-100)] text-[var(--mist-600)] hover:bg-[var(--mist-200)]"
                }`}
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </button>
          ))}
          {selectedRarities.length > 0 && (
            <button
              onClick={() => setSelectedRarities([])}
              className="px-3 py-1.5 text-sm text-[var(--mist-500)] hover:text-[var(--forest-700)]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-[var(--mist-100)] rounded-[var(--radius-lg)] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Species Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecies.map((species) => (
            <Link
              key={species.id}
              href={`/u/${username}/species/${species.id}`}
              className="group bg-white rounded-[var(--radius-lg)] border border-[var(--border-light)]
                overflow-hidden hover:shadow-[var(--shadow-md)] hover:border-[var(--moss-300)]
                transition-all duration-[var(--timing-fast)]"
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-[var(--mist-100)]">
                  {(species.coverPhoto || species.latestPhoto) ? (
                    <Image
                      src={species.coverPhoto?.thumbnailUrl || species.latestPhoto?.thumbnailUrl || ""}
                      alt={species.commonName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[var(--mist-300)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--forest-900)] truncate
                        group-hover:text-[var(--moss-700)] transition-colors">
                        {species.commonName}
                      </h3>
                      {species.scientificName && (
                        <p className="text-xs text-[var(--mist-500)] italic truncate">
                          {species.scientificName}
                        </p>
                      )}
                    </div>
                    <RarityBadge rarity={species.rarity} size="sm" />
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-[var(--mist-500)]">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {species.photoCount} {species.photoCount === 1 ? "photo" : "photos"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSpecies.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mist-100)]
            flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--mist-400)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--forest-900)] mb-1">
            No species found
          </h3>
          <p className="text-[var(--mist-600)]">
            {selectedRarities.length > 0
              ? "Try adjusting your filters"
              : "This gallery doesn't have any species yet"}
          </p>
        </div>
      )}
    </div>
  );
}
