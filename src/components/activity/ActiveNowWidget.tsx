"use client";

import { useState, useEffect } from "react";
import { ActiveNowResponse } from "@/types";
import Link from "next/link";

const HOUR_LABELS = [
  "12am", "1am", "2am", "3am", "4am", "5am",
  "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
];

export default function ActiveNowWidget() {
  const [data, setData] = useState<ActiveNowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveNow = async () => {
      try {
        const res = await fetch("/api/activity/current");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Unable to load activity data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveNow();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--mist-100)] p-6 animate-pulse">
        <div className="h-6 w-40 bg-[var(--mist-100)] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-[var(--mist-50)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Silently hide if no data or error
  if (error || !data || data.activeSpecies.length === 0) {
    return null;
  }

  const currentHourLabel = HOUR_LABELS[data.currentHour];
  const maxScore = Math.max(...data.activeSpecies.map((s) => s.activityScore));

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[var(--amber-50)] to-[var(--orange-50)] border-b border-[var(--mist-100)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--amber-600)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="font-semibold text-[var(--text-primary)]">
              Active Right Now
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-[var(--amber-500)] rounded-full animate-pulse" />
            <span className="text-[var(--mist-500)]">{currentHourLabel}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-sm text-[var(--mist-600)] mb-4">
          Based on historical activity patterns, these species are typically active at this hour:
        </p>

        <div className="space-y-2">
          {data.activeSpecies.map((species, index) => {
            const activityPercent = maxScore > 0 ? (species.activityScore / maxScore) * 100 : 0;

            return (
              <Link
                key={index}
                href={`/species?search=${encodeURIComponent(species.speciesName)}`}
                className="block group"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mist-50)] hover:bg-[var(--amber-50)] transition-colors cursor-pointer">
                  {/* Species name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-label)] group-hover:text-[var(--amber-700)] transition-colors">
                      {species.speciesName}
                    </div>
                    <div className="text-xs text-[var(--mist-500)] mt-0.5">
                      {species.recentCount} detections in last 30 days
                    </div>
                  </div>

                  {/* Activity bar */}
                  <div className="w-24 flex-shrink-0">
                    <div className="h-2 bg-[var(--mist-200)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--amber-400)] to-[var(--orange-400)] rounded-full transition-all"
                        style={{ width: `${activityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Arrow icon */}
                  <svg
                    className="w-5 h-5 text-[var(--mist-400)] group-hover:text-[var(--amber-600)] transition-colors flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer tip */}
        {data.activeSpecies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--mist-100)]">
            <div className="flex items-start gap-2 text-sm text-[var(--mist-600)]">
              <span className="text-[var(--amber-600)] flex-shrink-0">💡</span>
              <p>
                These predictions are based on the last 30 days of activity data at this time of day.
                Actual bird presence may vary based on weather and season.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
