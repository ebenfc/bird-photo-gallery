"use client";

import { useState, useEffect } from "react";
import { ActivityPattern } from "@/types";

interface ActivityTimelineProps {
  speciesName: string;
  compact?: boolean;
}

const HOUR_LABELS = [
  "12a", "1a", "2a", "3a", "4a", "5a",
  "6a", "7a", "8a", "9a", "10a", "11a",
  "12p", "1p", "2p", "3p", "4p", "5p",
  "6p", "7p", "8p", "9p", "10p", "11p"
];

export default function ActivityTimeline({ speciesName, compact = false }: ActivityTimelineProps) {
  const [pattern, setPattern] = useState<ActivityPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPattern = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/activity/species/${encodeURIComponent(speciesName)}`);
        if (!res.ok) {
          if (res.status === 404) {
            setPattern(null);
            return;
          }
          throw new Error("Failed to fetch");
        }
        const data = await res.json();
        setPattern(data.pattern);
      } catch (err) {
        setError("Unable to load activity data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPattern();
  }, [speciesName]);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--mist-100)] p-4 animate-pulse">
        <div className="h-5 w-40 bg-[var(--mist-100)] rounded mb-4" />
        <div className="h-24 bg-[var(--mist-50)] rounded" />
      </div>
    );
  }

  // Silently hide if no data available
  if (error || !pattern) {
    return null;
  }

  const maxCount = Math.max(...pattern.hourlyBreakdown.map((h) => h.count));
  const currentHour = new Date().getHours();

  // Format peak hours as readable time ranges
  const formatPeakHours = (peaks: number[]): string => {
    if (peaks.length === 0) return "";

    // Group consecutive hours into ranges
    const ranges: string[] = [];
    let start: number = peaks[0]!;
    let end: number = peaks[0]!;

    for (let i = 1; i <= peaks.length; i++) {
      const current = peaks[i];
      if (i < peaks.length && current === end + 1) {
        end = current;
      } else {
        if (start === end) {
          ranges.push(HOUR_LABELS[start]!);
        } else {
          ranges.push(`${HOUR_LABELS[start]!}-${HOUR_LABELS[(end + 1) % 24]!}`);
        }
        if (i < peaks.length && current !== undefined) {
          start = current;
          end = current;
        }
      }
    }

    return ranges.join(", ");
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[var(--amber-50)] to-[var(--orange-50)] border-b border-[var(--mist-100)]">
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
            <h3 className="font-semibold text-[var(--text-primary)]">Activity Timeline</h3>
          </div>
          <span className="text-xs text-[var(--mist-500)]">
            {pattern.totalDetections.toLocaleString()} detections
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        {/* Peak hours callout */}
        {pattern.peakHours.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm flex-wrap">
            <span className="text-[var(--mist-500)]">Peak activity:</span>
            <div className="flex gap-1 flex-wrap">
              {pattern.peakHours.map((hour) => (
                <span
                  key={hour}
                  className="px-2 py-0.5 bg-[var(--amber-100)] text-[var(--amber-700)] rounded-full font-medium text-xs"
                >
                  {HOUR_LABELS[hour]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bar chart */}
        <div className="flex items-end gap-0.5 h-20">
          {pattern.hourlyBreakdown.map((hourData) => {
            const heightPercent = maxCount > 0 ? (hourData.count / maxCount) * 100 : 0;
            const isCurrentHour = hourData.hour === currentHour;
            const isPeakHour = pattern.peakHours.includes(hourData.hour);

            return (
              <div
                key={hourData.hour}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    isCurrentHour
                      ? "bg-[var(--sky-500)]"
                      : isPeakHour
                      ? "bg-[var(--amber-400)]"
                      : "bg-[var(--moss-300)] group-hover:bg-[var(--moss-400)]"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  title={`${HOUR_LABELS[hourData.hour]}: ${hourData.count} detections`}
                />

                {/* Current hour indicator */}
                {isCurrentHour && (
                  <div className="absolute -top-1 w-1.5 h-1.5 bg-[var(--sky-500)] rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Hour labels */}
        <div className="flex justify-between mt-2 text-xs text-[var(--mist-400)]">
          {compact ? (
            <>
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </>
          ) : (
            <>
              <span>12a</span>
              <span>4a</span>
              <span>8a</span>
              <span>12p</span>
              <span>4p</span>
              <span>8p</span>
              <span>12a</span>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--mist-500)]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[var(--sky-500)] rounded" />
            <span>Now</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[var(--amber-400)] rounded" />
            <span>Peak</span>
          </div>
        </div>

        {/* Best photography window */}
        {pattern.peakHours.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--mist-100)]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--amber-600)]">🎯</span>
              <span className="text-[var(--forest-700)]">
                Best photography window: <span className="font-medium">{formatPeakHours(pattern.peakHours)}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
