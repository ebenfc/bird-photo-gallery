"use client";

import { useState, useEffect } from "react";
import { SuggestionsResponse } from "@/types";
import Link from "next/link";
import RarityBadge from "@/components/ui/RarityBadge";

/**
 * Format timestamp as relative time ago
 */
function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const then = date.getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays < 14 ? "" : "s"} ago`;
  return `${Math.floor(diffDays / 30)} month${diffDays < 60 ? "" : "s"} ago`;
}

export default function PhotoThisNextWidget() {
  const [data, setData] = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/suggestions?limit=3");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Unable to load suggestions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] p-6 animate-pulse">
        <div className="h-6 w-40 bg-[var(--mist-100)] rounded mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-[var(--mist-50)] rounded" />
          <div className="h-6 bg-[var(--mist-50)] rounded w-2/3" />
          <div className="h-12 bg-[var(--mist-50)] rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-[var(--mist-50)] rounded" />
            <div className="h-16 bg-[var(--mist-50)] rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Silently hide if no data or error
  if (error || !data || !data.topSuggestion) {
    return null;
  }

  const suggestion = data.topSuggestion;

  // Determine score color based on priority level
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "from-[var(--red-500)] to-[var(--orange-500)]";
    if (score >= 60) return "from-[var(--orange-500)] to-[var(--amber-500)]";
    if (score >= 40) return "from-[var(--amber-500)] to-[var(--yellow-500)]";
    return "from-[var(--moss-500)] to-[var(--forest-500)]";
  };

  const scoreColor = getScoreColor(suggestion.score);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[var(--moss-50)] to-[var(--forest-50)] border-b border-[var(--mist-100)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[var(--moss-600)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="font-semibold text-[var(--forest-900)]">
              Photo This Next!
            </h3>
          </div>
          <span className="text-xs text-[var(--mist-500)]">Top Priority</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--forest-50)] to-[var(--moss-50)]">
          {/* Species name with rarity badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="text-xl font-bold text-[var(--forest-900)]">
              {suggestion.commonName}
            </h4>
            <RarityBadge rarity={suggestion.rarity} />
          </div>

          {/* Scientific name */}
          {suggestion.scientificName && (
            <p className="text-sm italic text-[var(--mist-600)] mb-4">
              {suggestion.scientificName}
            </p>
          )}

          {/* Priority score */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-[var(--forest-800)]">
                Priority Score
              </span>
              <span className="text-sm font-bold text-[var(--forest-900)]">
                {suggestion.score}/100
              </span>
            </div>
            <div className="h-2.5 bg-[var(--mist-200)] rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${scoreColor} rounded-full transition-all`}
                style={{ width: `${suggestion.score}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-white/60 border border-[var(--mist-100)]">
              <div className="text-xl font-bold text-[var(--sky-700)]">
                {suggestion.yearlyCount.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--mist-600)] flex items-center justify-center gap-1">
                <span>🎧</span>
                <span>Detections</span>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/60 border border-[var(--mist-100)]">
              <div className="text-xl font-bold text-[var(--moss-700)]">
                {suggestion.photoCount}
              </div>
              <div className="text-xs text-[var(--mist-600)] flex items-center justify-center gap-1">
                <span>📷</span>
                <span>Photos</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="p-3 bg-white/80 rounded-lg border border-[var(--mist-200)] mb-4">
            <p className="text-sm text-[var(--forest-800)]">
              <span className="font-medium">Why priority?</span> {suggestion.reason}
            </p>
          </div>

          {/* Last heard */}
          {suggestion.lastHeard && (
            <p className="text-xs text-[var(--mist-600)] mb-4">
              Last heard: {formatTimeAgo(new Date(suggestion.lastHeard))}
            </p>
          )}

          {/* Action button */}
          <Link
            href={`/species/${suggestion.id}`}
            className="block w-full py-3 px-4 text-center rounded-xl
              bg-gradient-to-r from-[var(--moss-500)] to-[var(--forest-600)]
              text-white font-semibold
              hover:from-[var(--moss-600)] hover:to-[var(--forest-700)]
              hover:shadow-[var(--shadow-moss-md)]
              active:scale-[0.98]
              transition-all duration-[var(--timing-fast)]"
          >
            View Species Details →
          </Link>
        </div>

        {/* Secondary suggestions (optional) */}
        {data.suggestions.length > 1 && (
          <div className="mt-4 pt-4 border-t border-[var(--mist-100)]">
            <p className="text-xs font-medium text-[var(--mist-500)] mb-2">
              Also consider:
            </p>
            <div className="space-y-2">
              {data.suggestions.slice(1, 3).map((s) => (
                <Link
                  key={s.id}
                  href={`/species/${s.id}`}
                  className="flex items-center justify-between p-2 rounded-lg
                    bg-[var(--mist-50)] hover:bg-[var(--moss-50)]
                    transition-colors group"
                >
                  <span className="text-sm text-[var(--forest-800)] group-hover:text-[var(--moss-700)]">
                    {s.commonName}
                  </span>
                  <span className="text-xs font-medium text-[var(--mist-600)]">
                    {s.score}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
