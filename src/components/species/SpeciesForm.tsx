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

interface SpeciesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    commonName: string;
    scientificName?: string;
    description?: string;
    rarity?: Rarity;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: {
    commonName: string;
    scientificName?: string;
    description?: string;
    rarity?: Rarity;
  };
  title?: string;
  photoCount?: number;
}

export default function SpeciesForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialData,
  title = "Add New Species",
  photoCount = 0,
}: SpeciesFormProps) {
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<Rarity>("common");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  // Lookup states
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<BirdLookupResult | null>(null);
  const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCommonName(initialData?.commonName || "");
      setScientificName(initialData?.scientificName || "");
      setDescription(initialData?.description || "");
      setRarity(initialData?.rarity || "common");
      setError("");
      setLookupResult(null);
    }
  }, [isOpen, initialData]);

  // Auto-lookup when editing a species without scientific name
  useEffect(() => {
    if (isOpen && initialData?.commonName && !initialData?.scientificName && !scientificName) {
      // Auto-trigger lookup for existing species missing scientific name
      handleLookup();
    }
  }, [isOpen, initialData]);

  // Manual lookup function
  const handleLookup = async () => {
    if (!commonName.trim() || commonName.trim().length < 3) return;

    setLookupLoading(true);
    try {
      const res = await fetch(`/api/birds/lookup?name=${encodeURIComponent(commonName.trim())}`);
      if (res.ok) {
        const data: BirdLookupResult = await res.json();
        setLookupResult(data);
        // Auto-fill if scientific name is empty
        if (data.scientificName && !scientificName) {
          setScientificName(data.scientificName);
        }
        // Auto-fill description if empty and we have one
        if (data.description && !description) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonName.trim()) {
      setError("Common name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({
        commonName: commonName.trim(),
        scientificName: scientificName.trim() || undefined,
        description: description.trim() || undefined,
        rarity,
      });
      onClose();
    } catch (err) {
      setError("Failed to save species");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCommonName("");
    setScientificName("");
    setDescription("");
    setRarity("common");
    setError("");
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      handleClose();
    } catch (err) {
      setError("Failed to delete species");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit} className="p-6 pt-8">
        {/* Header with bird icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[var(--forest-700)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--forest-900)]">{title}</h2>
        </div>

        <div className="space-y-5">
          <Input
            label="Common Name *"
            placeholder="e.g., Northern Cardinal"
            value={commonName}
            onChange={(e) => setCommonName(e.target.value)}
            error={error && !commonName.trim() ? error : undefined}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[var(--mist-700)]">
                Scientific Name
              </label>
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookupLoading || !commonName.trim()}
                className="text-xs text-[var(--moss-600)] hover:text-[var(--moss-700)] font-medium
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {lookupLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-[var(--moss-300)] border-t-transparent rounded-full animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Look up
                  </>
                )}
              </button>
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

          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Optional notes about this species..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-4 py-2.5 border border-[var(--mist-200)] rounded-xl shadow-sm
                bg-white text-[var(--foreground)] placeholder-[var(--mist-400)]
                focus:outline-none focus:ring-2 focus:ring-[var(--moss-400)] focus:border-[var(--moss-400)]
                hover:border-[var(--mist-300)] transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--mist-700)] mb-1.5">
              Rarity
            </label>
            <div className="flex gap-2">
              {(["common", "uncommon", "rare"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRarity(r)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    rarity === r
                      ? r === "common"
                        ? "bg-slate-100 border-slate-300 text-slate-700"
                        : r === "uncommon"
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-red-50 border-red-300 text-red-700"
                      : "bg-white border-[var(--mist-200)] text-[var(--mist-500)] hover:border-[var(--mist-300)]"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && commonName.trim() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && onDelete && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <p className="text-sm text-red-800 font-medium">
                Delete this species?
              </p>
            </div>
            <p className="text-sm text-red-600 mb-4 ml-7">
              {photoCount > 0
                ? `This will also delete ${photoCount} photo${photoCount !== 1 ? "s" : ""} associated with this species.`
                : "This action cannot be undone."}
            </p>
            <div className="flex gap-2 ml-7">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-[var(--mist-100)]">
          {/* Delete button - only shown when editing */}
          {onDelete && !showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || showDeleteConfirm}>
              {loading ? "Saving..." : "Save Species"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
