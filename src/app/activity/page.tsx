"use client";

import ActiveNowWidget from "@/components/activity/ActiveNowWidget";
import PropertyStatsWidget from "@/components/stats/PropertyStatsWidget";
import PhotoThisNextWidget from "@/components/suggestions/PhotoThisNextWidget";

export default function ActivityPage() {
  return (
    <div className="pnw-texture min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
          Haikubox Activity
        </h1>
        <p className="text-[var(--mist-600)]">
          Bird detection insights and photo suggestions from your Haikubox
        </p>
      </div>

      {/* Property Stats Widget */}
      <div className="mb-8">
        <PropertyStatsWidget />
      </div>

      {/* Activity and Suggestion Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveNowWidget />
        <PhotoThisNextWidget />
      </div>
    </div>
  );
}
