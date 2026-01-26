"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PropertyStats } from "@/types";

export default function PropertyStatsWidget() {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/haikubox/stats");
        if (!res.ok) throw new Error("Failed to fetch");
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] p-6 animate-pulse">
        <div className="h-6 w-40 bg-[var(--mist-100)] rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--mist-50)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Silently hide widget if Haikubox unavailable or no data
  if (error || !stats || stats.totalHeard === 0) {
    return null;
  }

  const captureRate =
    stats.totalHeard > 0
      ? Math.round((stats.totalPhotographed / stats.totalHeard) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden">
        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-[var(--sky-50)]">
              <div className="text-2xl font-bold text-[var(--sky-700)]">
                {stats.totalHeard}
              </div>
              <div className="text-xs text-[var(--mist-500)]">Species Heard</div>
            </div>
            <Link href="/species">
              <div className="text-center p-3 rounded-xl bg-[var(--moss-50)]
                hover:bg-[var(--moss-100)] cursor-pointer
                transition-all duration-[var(--timing-fast)] hover:scale-105 active:scale-95
                hover:shadow-[var(--shadow-sm)]">
                <div className="text-2xl font-bold text-[var(--moss-700)]">
                  {stats.totalPhotographed}
                </div>
                <div className="text-xs text-[var(--mist-500)]">Photographed</div>
              </div>
            </Link>
            <div className="text-center p-3 rounded-xl bg-[var(--forest-50)]">
              <div className="text-2xl font-bold text-[var(--forest-700)]">
                {captureRate}%
              </div>
              <div className="text-xs text-[var(--mist-500)]">Capture Rate</div>
            </div>
          </div>
        </div>

        {/* Footer with year */}
        <div className="px-6 py-2 bg-[var(--mist-25)] border-t border-[var(--mist-100)]">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--mist-400)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span className="text-xs text-[var(--mist-500)]">
              Property Activity {stats.year}
            </span>
          </div>
        </div>
      </div>
  );
}
