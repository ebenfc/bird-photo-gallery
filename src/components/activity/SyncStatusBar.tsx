"use client";

import { useState, useEffect, useCallback } from "react";

interface SyncStatusBarProps {
  onSyncComplete: () => void;
}

/** Format a date as a human-readable relative time string */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export default function SyncStatusBar({ onSyncComplete }: SyncStatusBarProps) {
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [totalDetections, setTotalDetections] = useState<number>(0);
  const [syncing, setSyncing] = useState(false);
  const [lastManualSync, setLastManualSync] = useState<number>(0);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/haikubox/sync");
      if (!res.ok) return;
      const data = await res.json();
      if (data.lastSync?.syncedAt) {
        setLastSyncAt(new Date(data.lastSync.syncedAt));
      }
      setTotalDetections(data.totalDetections || 0);
    } catch {
      // Silently fail — non-critical UI element
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // Clear sync result message after 5 seconds
  useEffect(() => {
    if (!syncResult) return;
    const timer = setTimeout(() => setSyncResult(null), 5000);
    return () => clearTimeout(timer);
  }, [syncResult]);

  const cooldownRemaining = Math.max(
    0,
    COOLDOWN_MS - (Date.now() - lastManualSync)
  );
  const onCooldown = cooldownRemaining > 0;

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/haikubox/sync", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        setLastManualSync(Date.now());
        setLastSyncAt(new Date());
        setSyncResult({
          success: true,
          message: `Synced ${data.processed} species`,
        });
        onSyncComplete();
      } else if (res.status === 429) {
        setSyncResult({
          success: false,
          message: "Please wait a moment before syncing again.",
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || "Sync failed. Try again later.",
        });
      }
    } catch {
      setSyncResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return null;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4
        px-4 py-3 bg-[var(--mist-50)] rounded-[var(--radius-lg)]
        border border-[var(--border-light)]"
    >
      {/* Left: sync status */}
      <div className="flex items-center gap-2 text-sm text-[var(--mist-600)]">
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>
          {lastSyncAt
            ? `Last synced ${formatRelativeTime(lastSyncAt)}`
            : "Not yet synced"}
          {totalDetections > 0 && (
            <span className="text-[var(--mist-400)]">
              {" "}
              &middot; {totalDetections} species tracked
            </span>
          )}
        </span>
      </div>

      {/* Right: sync button + result */}
      <div className="flex items-center gap-3">
        {syncResult && (
          <span
            className={`text-xs font-medium ${
              syncResult.success
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {syncResult.message}
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={syncing || onCooldown}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
            bg-[var(--card-bg)] text-[var(--forest-700)] border border-[var(--mist-200)]
            rounded-[var(--radius-md)] shadow-[var(--shadow-xs)]
            hover:bg-[var(--surface-moss)] hover:border-[var(--moss-300)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--timing-fast)] active:scale-95"
        >
          {syncing ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sync Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
