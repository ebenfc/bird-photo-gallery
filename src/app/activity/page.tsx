"use client";

import ActiveNowWidget from "@/components/activity/ActiveNowWidget";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";

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

      {/* Property Stats Widget */}
      <div className="mb-8">
        <PropertyStatsWidget />
      </div>

      {/* Active Now Widget */}
      <div className="max-w-2xl">
        <ActiveNowWidget />
      </div>
    </div>
  );
}
