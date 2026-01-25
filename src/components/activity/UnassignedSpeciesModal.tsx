"use client";

import { useState, useEffect, useRef } from "react";
import { Rarity } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

interface BirdLookupResult {
  commonName: string;
  scientificName: string | null;
  description: string | null;
  source: string;
}

interface UnassignedSpeciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    commonName: string;
    scientificName?: string;
    description?: string;
    rarity: Rarity;
  }) => Promise<void>;
  detectionCommonName: string;
}

export default function UnassignedSpeciesModal({
  isOpen,
  onClose,
  onSubmit,
  detectionCommonName,
}: UnassignedSpeciesModalProps) {
  const [scientificName, setScientificName] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<Rarity>("common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lookup states
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<BirdLookupResult | null>(
    null
  );
  const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lookup function
  const performLookup = async (nameToLookup: string) => {
    if (!nameToLookup.trim() || nameToLookup.trim().length < 3) return;

    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/birds/lookup?name=${encodeURIComponent(nameToLookup.trim())}`
      );
      if (res.ok) {
        const data: BirdLookupResult = await res.json();
        setLookupResult(data);
        // Auto-fill if scientific name is empty
        if (data.scientificName) {
          setScientificName(data.scientificName);
        }
        // Auto-fill description if empty and we have one
        if (data.description) {
          setDescription(data.description);
        }
      } else {
        setLookupResult(null);
      }
    } catch (err) {
      console.error("Bird lookup failed:", err);
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Reset form and trigger lookup when modal opens with new detection
  useEffect(() => {
    if (isOpen && detectionCommonName) {
      setScientificName("");
      setDescription("");
      setRarity("common");
      setError("");
      setLookupResult(null);

      // Clear any pending lookups
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current);
        lookupTimeoutRef.current = null;
      }

      // Auto-lookup for the pre-filled name
      performLookup(detectionCommonName);
    }

    // Capture the current timeout for cleanup
    const currentTimeout = lookupTimeoutRef.current;
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [isOpen, detectionCommonName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await onSubmit({
        commonName: detectionCommonName,
        scientificName: scientificName.trim() || undefined,
        description: description.trim() || undefined,
        rarity,
      });
      onClose();
    } catch (err) {
      setError("Failed to create species");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScientificName("");
    setDescription("");
    setRarity("common");
    setError("");
    setLookupResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--forest-900)]">
              Assign Species
            </h2>
            <p className="text-sm text-[var(--mist-500)]">
              Create a new species entry for this detection
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Common Name (read-only, pre-filled from detection) */}
          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-1.5">
              Common Name
            </label>
            <div className="px-4 py-2.5 bg-[var(--mist-50)] border border-[var(--mist-200)] rounded-xl text-[var(--forest-800)] font-medium">
              {detectionCommonName}
            </div>
            <p className="mt-1 text-xs text-[var(--mist-500)]">
              From Haikubox detection
            </p>
          </div>

          {/* Scientific Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[var(--mist-700)]">
                Scientific Name
              </label>
              {lookupLoading && (
                <span className="text-xs text-[var(--moss-600)] flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-[var(--moss-300)] border-t-transparent rounded-full animate-spin" />
                  Looking up...
                </span>
              )}
            </div>
            <Input
              placeholder="e.g., Cardinalis cardinalis"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
            />
            {lookupResult && !scientificName && lookupResult.scientificName && (
              <button
                type="button"
                onClick={() => setScientificName(lookupResult.scientificName!)}
                className="mt-1.5 text-xs text-[var(--moss-600)] hover:text-[var(--moss-700)] underline"
              >
                Use &quot;{lookupResult.scientificName}&quot;
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Optional notes about this species..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="block w-full px-4 py-2.5 border border-[var(--mist-200)] rounded-xl shadow-sm
                bg-white text-[var(--foreground)] placeholder-[var(--mist-400)]
                focus:outline-none focus:ring-2 focus:ring-[var(--moss-400)] focus:border-[var(--moss-400)]
                hover:border-[var(--mist-300)] transition-colors text-sm resize-none"
            />
          </div>

          {/* Rarity Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-1.5">
              Rarity *
            </label>
            <p className="text-xs text-[var(--mist-500)] mb-2">
              How often do you see this species on your property?
            </p>
            <div className="flex gap-2">
              {(["common", "uncommon", "rare"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRarity(r)}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    rarity === r
                      ? r === "common"
                        ? "bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                        : r === "uncommon"
                        ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm"
                        : "bg-red-50 border-red-300 text-red-700 shadow-sm"
                      : "bg-white border-[var(--mist-200)] text-[var(--mist-500)] hover:border-[var(--mist-300)]"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--mist-100)]">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Species"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
