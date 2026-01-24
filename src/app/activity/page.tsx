"use client";

import { useState, useEffect } from "react";
import ActiveNowWidget from "@/components/activity/ActiveNowWidget";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";
import BubbleChart from "@/components/activity/BubbleChart";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import type { PropertyStats } from "@/types";

/**
 * Activity Page - Haikubox Integration
 *
 * This page should only be accessible to users who have integrated their Bird Feed
 * app with a Haikubox device. It displays bird detection insights and activity
 * data from the Haikubox.
 *
 * Note: Navigation to this page is currently always visible. Consider implementing
 * conditional rendering in the Header component based on Haikubox integration status.
 */
export default function ActivityPage() {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/haikubox/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError("Unable to load Haikubox stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="pnw-texture min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
          Haikubox Activity
        </h1>
        <p className="text-[var(--mist-600)]">
          Bird detection insights from your Haikubox
        </p>
      </div>

      {/* Bubble Chart Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[var(--sky-50)] to-[var(--moss-50)] border-b border-[var(--mist-100)]">
            <h3 className="font-semibold text-[var(--forest-900)]">
              Bird Activity Overview
            </h3>
            <p className="text-sm text-[var(--mist-600)]">
              Bubble size shows visit frequency. Click to view species details.
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-pulse text-[var(--mist-500)]">
                  Loading activity data...
                </div>
              </div>
            ) : error || !stats ? (
              <div className="flex items-center justify-center h-[400px] text-[var(--mist-500)]">
                <div className="text-center">
                  <p className="text-lg font-medium">Unable to load activity data</p>
                  <p className="text-sm mt-1">
                    {error || "Please try again later"}
                  </p>
                </div>
              </div>
            ) : (
              <BubbleChart data={stats.recentlyHeard} />
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics - Collapsible Section */}
      <div className="mb-8">
        <CollapsibleSection
          title="Detailed Statistics & Rankings"
          defaultExpanded={false}
        >
          <PropertyStatsWidget stats={stats} loading={loading} />
        </CollapsibleSection>
      </div>

      {/* Active Now Widget */}
      <div className="max-w-2xl">
        <ActiveNowWidget />
      </div>
    </div>
  );
}
