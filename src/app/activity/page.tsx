"use client";

import { useEffect, useState } from "react";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";
import SpeciesActivityList from "@/components/activity/SpeciesActivityList";
import { SpeciesActivityData } from "@/types";

/**
 * Activity Page - Haikubox Integration
 *
 * Displays comprehensive bird detection insights and activity data from the Haikubox,
 * including detection counts, rarity status, and photo capture status.
 * Users can filter by rarity and photo status, and sort by various criteria.
 */
export default function ActivityPage() {
  const [activityData, setActivityData] = useState<SpeciesActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivityData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/haikubox/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch activity data");
        }

        const data = await response.json();

        // Transform recentlyHeard data to SpeciesActivityData format
        const activityData: SpeciesActivityData[] = data.recentlyHeard.map(
          (item: {
            commonName: string;
            speciesId: number | null;
            yearlyCount: number;
            lastHeardAt: string | null;
            hasPhoto: boolean;
            rarity: string | null;
          }) => ({
            commonName: item.commonName,
            speciesId: item.speciesId,
            yearlyCount: item.yearlyCount,
            lastHeardAt: item.lastHeardAt,
            hasPhoto: item.hasPhoto,
            // Default to "common" if rarity is null (unmatched species)
            rarity: (item.rarity as "common" | "uncommon" | "rare") || "common",
          })
        );

        setActivityData(activityData);
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchActivityData();
  }, []);

  return (
    <div className="pnw-texture min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
          Haikubox Activity
        </h1>
        <p className="text-[var(--mist-600)]">
          Comprehensive view of all detected bird species
        </p>
      </div>

      {/* Property Stats Widget */}
      <div className="mb-8">
        <PropertyStatsWidget />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[var(--radius-lg)] p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Error Loading Activity Data
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Species Activity List */}
      <div className="mb-8">
        <SpeciesActivityList data={activityData} loading={loading} />
      </div>
    </div>
  );
}
