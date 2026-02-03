"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";
import SpeciesActivityList from "@/components/activity/SpeciesActivityList";
import UnassignedSpeciesModal from "@/components/activity/UnassignedSpeciesModal";
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

        {/* Setup Guidance Card */}
        <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] border border-[var(--border-light)] overflow-hidden">
          <div className="text-center py-12 px-6">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--sky-100)] to-[var(--moss-100)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[var(--forest-900)] mb-3">
              Connect Your Haikubox
            </h2>
            <p className="text-[var(--mist-600)] max-w-md mx-auto mb-6">
              Track which bird species visit your property automatically. Connect your Haikubox device
              to see detection data, species activity, and more.
            </p>

            {/* Feature preview */}
            <div className="bg-[var(--mist-50)] rounded-[var(--radius-md)] p-4 mb-6 max-w-sm mx-auto">
              <p className="text-sm font-medium text-[var(--forest-800)] mb-2">
                With Haikubox, you&apos;ll see:
              </p>
              <ul className="text-sm text-[var(--mist-600)] text-left space-y-1">
                <li>• Species detected on your property this year</li>
                <li>• Detection counts and last heard times</li>
                <li>• Which species you&apos;ve photographed vs. only heard</li>
              </ul>
            </div>

            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)] text-white font-semibold rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] hover:from-[var(--forest-600)] hover:to-[var(--forest-700)] transition-all duration-[var(--timing-fast)] active:scale-95"
            >
              Set Up Haikubox
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Don't have a Haikubox? */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--mist-500)]">
            Don&apos;t have a Haikubox?{" "}
            <a
              href="https://haikubox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--moss-600)] hover:text-[var(--moss-700)] underline"
            >
              Learn more about it
            </a>
          </p>
        </div>
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
