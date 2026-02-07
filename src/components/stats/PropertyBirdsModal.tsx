"use client";

import { useState, useEffect, useMemo } from "react";
import { PropertyStats } from "@/types";

interface PropertyBirdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

export type TabType = "all" | "captured" | "opportunities";
type PriorityLevel = "high" | "medium" | "low";

interface BirdWithPriority {
  commonName: string;
  yearlyCount: number;
  lastHeardAt: string | null;
  priority: PriorityLevel;
}

function getPriorityLevel(count: number): PriorityLevel {
  if (count >= 500) return "high";
  if (count >= 100) return "medium";
  return "low";
}

function getPriorityLabel(priority: PriorityLevel): string {
  switch (priority) {
    case "high":
      return "High Priority (heard 500+ times)";
    case "medium":
      return "Medium Priority (heard 100-500x)";
    case "low":
      return "Low Priority (heard <100x)";
  }
}

function getPriorityIcon(priority: PriorityLevel): string {
  switch (priority) {
    case "high":
      return "🔥";
    case "medium":
      return "⭐";
    case "low":
      return "◌";
  }
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return count.toLocaleString();
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function PropertyBirdsModal({
  isOpen,
  onClose,
  initialTab = "all",
}: PropertyBirdsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Update active tab when initialTab changes (e.g., when opening with different tab)
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllLow, setShowAllLow] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/haikubox/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  // Group birds by priority
  const opportunitiesByPriority = useMemo(() => {
    if (!stats?.heardNotPhotographed) return { high: [], medium: [], low: [] };

    const grouped: Record<PriorityLevel, BirdWithPriority[]> = {
      high: [],
      medium: [],
      low: [],
    };

    stats.heardNotPhotographed.forEach((bird) => {
      const priority = getPriorityLevel(bird.yearlyCount);
      grouped[priority].push({ ...bird, priority });
    });

    // Sort each group by count descending
    Object.keys(grouped).forEach((key) => {
      grouped[key as PriorityLevel].sort((a, b) => b.yearlyCount - a.yearlyCount);
    });

    return grouped;
  }, [stats]);

  // Birds that have been photographed (from recentlyHeard with hasPhoto=true)
  const capturedBirds = useMemo(() => {
    if (!stats?.recentlyHeard) return [];
    return stats.recentlyHeard
      .filter((b) => b.hasPhoto)
      .sort((a, b) => b.yearlyCount - a.yearlyCount);
  }, [stats]);

  // All birds (both captured and not captured)
  const allBirds = useMemo(() => {
    if (!stats) return [];
    const allDetected = [...(stats.heardNotPhotographed || []), ...(capturedBirds || [])];
    return allDetected.sort((a, b) => b.yearlyCount - a.yearlyCount);
  }, [stats, capturedBirds]);

  if (!isOpen) return null;

  const totalOpportunities =
    (opportunitiesByPriority.high?.length || 0) +
    (opportunitiesByPriority.medium?.length || 0) +
    (opportunitiesByPriority.low?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--card-bg)] rounded-[var(--radius-xl)] shadow-[var(--shadow-2xl)] w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sky-100)] to-[var(--sky-200)] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[var(--sky-600)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Birds on Your Property
              </h2>
              <p className="text-sm text-[var(--mist-500)]">
                {stats?.totalHeard || 0} species detected by Haikubox in {stats?.year || new Date().getFullYear()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--mist-400)] hover:text-[var(--forest-700)] hover:bg-[var(--surface-moss)] rounded-[var(--radius-md)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-[var(--forest-100)] text-[var(--forest-700)]"
                : "text-[var(--mist-500)] hover:bg-[var(--mist-50)]"
            }`}
          >
            <span>🐦</span>
            <span>All ({stats?.totalHeard || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("captured")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "captured"
                ? "bg-[var(--moss-100)] text-[var(--forest-700)]"
                : "text-[var(--mist-500)] hover:bg-[var(--mist-50)]"
            }`}
          >
            <span>📷</span>
            <span>Captured ({stats?.heardAndPhotographed || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "opportunities"
                ? "bg-[var(--sky-100)] text-[var(--sky-700)]"
                : "text-[var(--mist-500)] hover:bg-[var(--mist-50)]"
            }`}
          >
            <span>📸</span>
            <span>Not Yet ({totalOpportunities})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--moss-200)] border-t-[var(--moss-600)]" />
            </div>
          ) : activeTab === "all" ? (
            /* All Birds Tab */
            <div className="space-y-2">
              {allBirds.length > 0 ? (
                allBirds.map((bird) => {
                  const hasPhoto = capturedBirds.some((b) => b.commonName === bird.commonName);
                  return (
                    <div
                      key={bird.commonName}
                      className={`flex items-center justify-between py-2 px-3 rounded-[var(--radius-md)] ${
                        hasPhoto ? "bg-[var(--surface-moss)]" : "bg-[var(--surface-sky)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={hasPhoto ? "text-[var(--moss-500)]" : "text-[var(--sky-500)]"}>
                          {hasPhoto ? "✓" : "◌"}
                        </span>
                        <span className="text-[var(--text-label)]">{bird.commonName}</span>
                      </div>
                      <span className="text-sm text-[var(--mist-500)]">
                        ({formatCount(bird.yearlyCount)}x heard)
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-[var(--mist-500)]">
                  <p>No birds detected yet</p>
                </div>
              )}
            </div>
          ) : activeTab === "opportunities" ? (
            <div className="space-y-6">
              {/* High Priority */}
              {opportunitiesByPriority.high.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--forest-700)] mb-3">
                    <span>{getPriorityIcon("high")}</span>
                    <span>{getPriorityLabel("high")}</span>
                  </h3>
                  <div className="space-y-3">
                    {opportunitiesByPriority.high.map((bird, i) => (
                      <div
                        key={bird.commonName}
                        className="bg-gradient-to-r from-[var(--amber-50)] to-[var(--orange-50)] rounded-[var(--radius-lg)] p-4 ring-1 ring-[var(--amber-200)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎧</span>
                              <span className="font-semibold text-[var(--text-primary)]">
                                {bird.commonName}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--mist-600)] mt-1">
                              {i === 0 && opportunitiesByPriority.high.length > 1
                                ? "Most heard! Your backyard superstar"
                                : "Frequently visiting your property"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-[var(--amber-700)] font-bold">
                              <span>🎯</span>
                              <span>{formatCount(bird.yearlyCount)}x</span>
                            </div>
                            {bird.lastHeardAt && (
                              <p className="text-xs text-[var(--mist-500)] mt-1">
                                {getRelativeTime(bird.lastHeardAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority */}
              {opportunitiesByPriority.medium.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--forest-700)] mb-3">
                    <span>{getPriorityIcon("medium")}</span>
                    <span>{getPriorityLabel("medium")}</span>
                  </h3>
                  <div className="space-y-2">
                    {opportunitiesByPriority.medium.map((bird) => (
                      <div
                        key={bird.commonName}
                        className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-md)] hover:bg-[var(--mist-50)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--mist-400)]">•</span>
                          <span className="text-[var(--text-label)]">{bird.commonName}</span>
                        </div>
                        <span className="text-sm text-[var(--mist-500)]">
                          ({formatCount(bird.yearlyCount)}x)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Priority */}
              {opportunitiesByPriority.low.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--forest-700)] mb-3">
                    <span>{getPriorityIcon("low")}</span>
                    <span>{getPriorityLabel("low")}</span>
                  </h3>
                  <div className="space-y-2">
                    {(showAllLow
                      ? opportunitiesByPriority.low
                      : opportunitiesByPriority.low.slice(0, 5)
                    ).map((bird) => (
                      <div
                        key={bird.commonName}
                        className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-md)] hover:bg-[var(--mist-50)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--mist-300)]">•</span>
                          <span className="text-[var(--mist-600)]">{bird.commonName}</span>
                        </div>
                        <span className="text-sm text-[var(--mist-400)]">
                          ({bird.yearlyCount}x)
                        </span>
                      </div>
                    ))}
                    {opportunitiesByPriority.low.length > 5 && !showAllLow && (
                      <button
                        onClick={() => setShowAllLow(true)}
                        className="text-sm text-[var(--sky-600)] hover:text-[var(--sky-700)] font-medium mt-2"
                      >
                        Show {opportunitiesByPriority.low.length - 5} more...
                      </button>
                    )}
                  </div>
                </div>
              )}

              {totalOpportunities === 0 && (
                <div className="text-center py-12 text-[var(--mist-500)]">
                  <p className="text-lg font-medium">Amazing!</p>
                  <p className="text-sm mt-1">
                    You&apos;ve photographed every species detected on your property!
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Captured Tab */
            <div className="space-y-2">
              {capturedBirds.length > 0 ? (
                capturedBirds.map((bird) => (
                  <div
                    key={bird.commonName}
                    className="flex items-center justify-between py-2 px-3 rounded-[var(--radius-md)] bg-[var(--surface-moss)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--moss-500)]">✓</span>
                      <span className="text-[var(--text-label)]">{bird.commonName}</span>
                    </div>
                    <span className="text-sm text-[var(--mist-500)]">
                      ({formatCount(bird.yearlyCount)}x heard)
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-[var(--mist-500)]">
                  <p>No matching data found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
