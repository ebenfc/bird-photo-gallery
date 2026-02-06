"use client";

import { useEffect, useState, useCallback } from "react";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";
import SpeciesActivityList from "@/components/activity/SpeciesActivityList";
import UnassignedSpeciesModal from "@/components/activity/UnassignedSpeciesModal";
import HaikuboxSetupCard from "@/components/activity/HaikuboxSetupCard";
import SyncStatusBar from "@/components/activity/SyncStatusBar";
import { SpeciesActivityData, Rarity } from "@/types";

// Track active filter count from child component
type ActiveFilters = { rarity: boolean; photo: boolean };

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

  // Haikubox configuration state
  const [haikuboxConfigured, setHaikuboxConfigured] = useState<boolean | null>(null);

  // Mobile filter toggle state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ rarity: false, photo: false });

  // Modal state for unassigned species
  const [unassignedModalOpen, setUnassignedModalOpen] = useState(false);
  const [selectedUnassigned, setSelectedUnassigned] =
    useState<SpeciesActivityData | null>(null);

  // Check if Haikubox is configured
  useEffect(() => {
    const checkHaikuboxSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setHaikuboxConfigured(!!data.haikuboxSerial);
      } catch {
        setHaikuboxConfigured(false);
      }
    };
    checkHaikuboxSettings();
  }, []);

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

  // Only fetch activity data when Haikubox is configured
  useEffect(() => {
    if (haikuboxConfigured === true) {
      fetchActivityData();
    } else if (haikuboxConfigured === false) {
      setLoading(false);
    }
  }, [haikuboxConfigured, fetchActivityData]);

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

  // Count active filters for the badge
  const activeFilterCount = (activeFilters.rarity ? 1 : 0) + (activeFilters.photo ? 1 : 0);

  // Loading state while checking Haikubox configuration
  if (haikuboxConfigured === null) {
    return (
      <div className="pnw-texture min-h-screen">
        <div className="hidden sm:block mb-8">
          <div className="h-9 w-32 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse mb-2" />
          <div className="h-5 w-80 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse" />
        </div>
        <div className="h-64 bg-[var(--mist-100)] rounded-[var(--radius-lg)] animate-pulse" />
      </div>
    );
  }

  // Setup guidance when Haikubox is not configured
  if (haikuboxConfigured === false) {
    return (
      <div className="pnw-texture min-h-screen">
        {/* Desktop header */}
        <div className="hidden sm:block mb-8">
          <h1 className="text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
            Activity
          </h1>
          <p className="text-[var(--mist-600)]">
            Bird species automatically detected by your Haikubox device on the property.
          </p>
        </div>

        {/* Mobile header */}
        <div className="sm:hidden mb-4">
          <h1 className="text-2xl font-bold text-[var(--forest-900)] tracking-tight">
            Activity
          </h1>
        </div>

        <HaikuboxSetupCard
          onConnected={() => {
            setHaikuboxConfigured(true);
            fetchActivityData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="pnw-texture min-h-screen">
      {/* Desktop header */}
      <div className="hidden sm:block mb-8">
        <h1 className="text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
          Activity
        </h1>
        <p className="text-[var(--mist-600)]">
          Bird species automatically detected by your Haikubox device on the property.
        </p>
      </div>

      {/* Mobile header - compact with filter toggle */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[var(--forest-900)] tracking-tight">
            Activity
          </h1>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold
              rounded-[var(--radius-lg)] border
              transition-all duration-[var(--timing-fast)] active:scale-95
              ${showMobileFilters || activeFilterCount > 0
                ? "bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)] text-white border-[var(--forest-600)]"
                : "bg-white text-[var(--forest-700)] border-[var(--mist-200)] hover:border-[var(--moss-300)]"
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-white/20">
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
          {activityData.length} species detected
        </p>
      </div>

      {/* Sync Status Bar */}
      <div className="mb-4">
        <SyncStatusBar onSyncComplete={fetchActivityData} />
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
          showMobileFilters={showMobileFilters}
          onActiveFiltersChange={setActiveFilters}
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
