"use client";

import { useEffect, useState, useCallback } from "react";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";
import SpeciesActivityList from "@/components/activity/SpeciesActivityList";
import UnassignedSpeciesModal from "@/components/activity/UnassignedSpeciesModal";
import { SpeciesActivityData, Rarity } from "@/types";

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

  // Modal state for unassigned species
  const [unassignedModalOpen, setUnassignedModalOpen] = useState(false);
  const [selectedUnassigned, setSelectedUnassigned] =
    useState<SpeciesActivityData | null>(null);

  // Fetch activity data - extracted to callback for reuse after creating species
  const fetchActivityData = useCallback(async () => {
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
          // Keep null for unassigned species (no matching species record)
          rarity: item.rarity as Rarity | null,
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
  }, []);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // Handler for clicking on unassigned species
  const handleUnassignedClick = (data: SpeciesActivityData) => {
    setSelectedUnassigned(data);
    setUnassignedModalOpen(true);
  };

  // Handler for creating species from modal
  const handleCreateSpecies = async (speciesData: {
    commonName: string;
    scientificName?: string;
    description?: string;
    rarity: Rarity;
  }) => {
    // 1. Create the species
    const createResponse = await fetch("/api/species", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(speciesData),
    });

    if (!createResponse.ok) {
      throw new Error("Failed to create species");
    }

    const { species: newSpecies } = await createResponse.json();

    // 2. Link existing detections to the new species
    await fetch("/api/haikubox/detections/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speciesId: newSpecies.id,
        detectionCommonName: speciesData.commonName,
      }),
    });

    // 3. Refresh the activity data
    await fetchActivityData();

    // 4. Close modal
    setUnassignedModalOpen(false);
    setSelectedUnassigned(null);
  };

  return (
    <div className="pnw-texture min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
          Activity
        </h1>
        <p className="text-[var(--mist-600)]">
          Bird species automatically detected by your Haikubox device on the property.
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
        <SpeciesActivityList
          data={activityData}
          loading={loading}
          onUnassignedClick={handleUnassignedClick}
        />
      </div>

      {/* Unassigned Species Modal */}
      {selectedUnassigned && (
        <UnassignedSpeciesModal
          isOpen={unassignedModalOpen}
          onClose={() => {
            setUnassignedModalOpen(false);
            setSelectedUnassigned(null);
          }}
          onSubmit={handleCreateSpecies}
          detectionCommonName={selectedUnassigned.commonName}
        />
      )}
    </div>
  );
}
