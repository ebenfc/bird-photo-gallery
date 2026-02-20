"use client";

import { useState, useEffect, useRef } from "react";
import type { EbirdImportResult, EbirdImportStatus } from "@/types";

export default function EbirdSettings() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<EbirdImportStatus | null>(null);
  const [result, setResult] = useState<EbirdImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load import status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch("/api/ebird/status");
        if (res.ok) {
          const data: EbirdImportStatus = await res.json();
          setStatus(data);
        }
      } catch {
        // Silent — status is informational
      }
    };
    loadStatus();
  }, []);

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ebird/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }

      setResult(data);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh status
      const statusRes = await fetch("/api/ebird/status");
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setError(null);

    try {
      const res = await fetch("/api/ebird/import", { method: "DELETE" });

      if (res.ok) {
        setStatus({ hasImport: false, totalSpecies: 0, lastImportedAt: null });
        setResult(null);
        setShowClearConfirm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to clear data");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Current status */}
      {status?.hasImport && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)] text-sm font-medium">
          {status.totalSpecies} species imported
          {status.lastImportedAt && ` on ${formatDate(status.lastImportedAt)}`}
        </div>
      )}

      {/* Instructions */}
      <div>
        <p className="text-sm text-[var(--mist-600)] mb-3">
          Import your eBird life list to see which species you&apos;ve observed but haven&apos;t yet photographed.
        </p>
        <ol className="text-sm text-[var(--mist-600)] space-y-1 list-decimal list-inside mb-3">
          <li>
            Go to{" "}
            <a
              href="https://ebird.org/downloadMyData"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--moss-700)] underline hover:text-[var(--moss-800)]"
            >
              Download My Data
            </a>{" "}
            and select <strong>My Observations</strong>
          </li>
          <li>eBird will email you a link to download your data as a CSV</li>
          <li>Upload that CSV file here</li>
        </ol>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          eBird Data File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError(null);
            setResult(null);
          }}
          className="w-full text-sm text-[var(--text-primary)]
            file:mr-3 file:py-2 file:px-4
            file:rounded-[var(--radius-md)] file:border-2
            file:border-[var(--moss-600)] file:text-[var(--moss-700)]
            file:bg-transparent file:font-medium file:cursor-pointer
            hover:file:bg-[var(--surface-moss)]
            file:transition-all file:duration-[var(--timing-fast)]"
        />
      </div>

      {/* Import button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="px-4 py-2.5 bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)]
            text-white rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-sm)]
            hover:from-[var(--forest-600)] hover:to-[var(--forest-700)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-[var(--timing-fast)] active:scale-95"
        >
          {importing ? "Importing..." : "Import Life List"}
        </button>

        {status?.hasImport && !showClearConfirm && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 border-2 border-[var(--danger-from)] text-[var(--danger-from)]
              rounded-[var(--radius-md)] font-medium
              hover:bg-[var(--error-bg)]
              transition-all duration-[var(--timing-fast)] active:scale-95"
          >
            Clear Import
          </button>
        )}
      </div>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--error-bg)] border border-[var(--error-border)]">
          <p className="text-sm text-[var(--error-text)] mb-2">
            This will remove all imported eBird data and your wish list. Are you sure?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={clearing}
              className="px-3 py-1.5 bg-[var(--danger-from)] text-white rounded-[var(--radius-md)]
                text-sm font-medium disabled:opacity-50
                transition-all duration-[var(--timing-fast)] active:scale-95"
            >
              {clearing ? "Clearing..." : "Yes, Clear"}
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 text-sm font-medium text-[var(--mist-600)]
                hover:text-[var(--text-primary)]
                transition-all duration-[var(--timing-fast)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import results */}
      {result && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--info-bg)] text-[var(--info-text)] border border-[var(--info-border)] text-sm font-medium">
          <p>
            Imported {result.imported} species. {result.matched} matched to your BirdFeed species,{" "}
            {result.unmatched} added to your wish list.
          </p>
          {result.errors && result.errors.length > 0 && (
            <p className="mt-1 text-xs opacity-75">
              Note: {result.errors.join(". ")}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)] text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
