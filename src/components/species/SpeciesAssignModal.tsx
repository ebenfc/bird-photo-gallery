"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Photo, Species, Rarity, HaikuboxDetection, PhotosResponse } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RarityBadge from "@/components/ui/RarityBadge";
import HeardBadge from "@/components/ui/HeardBadge";
import SwapPicker from "@/components/species/SwapPicker";
import { SPECIES_PHOTO_LIMIT } from "@/config/limits";

interface BirdLookupResult {
  commonName: string;
  scientificName: string | null;
  description: string | null;
  source: string;
}

interface NameValidation {
  isValid: boolean;
  suggestions: string[];
  errors: string[];
}

/**
 * Validate and suggest corrections for bird common names
 */
function validateBirdName(name: string): NameValidation {
  const errors: string[] = [];
  const suggestions: string[] = [];
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: true, suggestions: [], errors: [] };
  }

  // Check for proper capitalization (Title Case for most words)
  const words = trimmed.split(/\s+/);
  const properlyCapitalized = words.map((word, index) => {
    // Handle hyphenated words
    if (word.includes("-")) {
      return word
        .split("-")
        .map((part) => {
          // Capitalize first letter, lowercase rest
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-");
    }
    // Articles/prepositions in middle should be lowercase (but not first word)
    const lowercaseWords = ["the", "a", "an", "of", "and", "or"];
    if (index > 0 && lowercaseWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const correctedName = properlyCapitalized.join(" ");

  if (correctedName !== trimmed) {
    errors.push("Capitalization issue");
    suggestions.push(correctedName);
  }

  // Check for common missing apostrophes in possessive names
  const apostrophePatterns = [
    { wrong: /\bAnnas\b/i, correct: "Anna's" },
    { wrong: /\bHarriss\b/i, correct: "Harris's" },
    { wrong: /\bBairds\b/i, correct: "Baird's" },
    { wrong: /\bBewicks\b/i, correct: "Bewick's" },
    { wrong: /\bBullocks\b/i, correct: "Bullock's" },
    { wrong: /\bCoopers\b/i, correct: "Cooper's" },
    { wrong: /\bStellers\b/i, correct: "Steller's" },
    { wrong: /\bTownsends\b/i, correct: "Townsend's" },
    { wrong: /\bWilsons\b/i, correct: "Wilson's" },
    { wrong: /\bBrewers\b/i, correct: "Brewer's" },
    { wrong: /\bCassins\b/i, correct: "Cassin's" },
    { wrong: /\bLincolns\b/i, correct: "Lincoln's" },
    { wrong: /\bNuttalls\b/i, correct: "Nuttall's" },
  ];

  let currentName = (suggestions.length > 0 ? suggestions[0] : correctedName) ?? correctedName;
  for (const pattern of apostrophePatterns) {
    if (pattern.wrong.test(trimmed)) {
      errors.push(`Missing apostrophe in "${pattern.correct}"`);
      currentName = currentName.replace(pattern.wrong, pattern.correct);
      suggestions[0] = currentName;
    }
  }

  return {
    isValid: errors.length === 0,
    suggestions,
    errors,
  };
}

interface SpeciesAssignModalProps {
  photo: Photo | null;
  species: Species[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (photoId: number, speciesId: number, replacePhotoId?: number) => Promise<void>;
  onCreateAndAssign: (
    photoId: number,
    speciesData: { commonName: string; scientificName?: string; rarity?: Rarity }
  ) => Promise<void>;
  onSkip?: () => void;
  showSkip?: boolean;
  queuePosition?: { current: number; total: number };
}

export default function SpeciesAssignModal({
  photo,
  species,
  isOpen,
  onClose,
  onAssign,
  onCreateAndAssign,
  onSkip,
  showSkip = false,
  queuePosition,
}: SpeciesAssignModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCommonName, setNewCommonName] = useState("");
  const [newScientificName, setNewScientificName] = useState("");
  const [newRarity, setNewRarity] = useState<Rarity>("common");
  const [loading, setLoading] = useState(false);
  const [recentDetections, setRecentDetections] = useState<HaikuboxDetection[]>([]);

  // Swap picker state (shown when a curated species is selected)
  const [swapSpeciesId, setSwapSpeciesId] = useState<number | null>(null);
  const [swapPhotos, setSwapPhotos] = useState<Photo[]>([]);
  const [swapSelectedId, setSwapSelectedId] = useState<number | null>(null);
  const [loadingSwapPhotos, setLoadingSwapPhotos] = useState(false);

  // Name validation and lookup states
  const [nameValidation, setNameValidation] = useState<NameValidation>({ isValid: true, suggestions: [], errors: [] });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<BirdLookupResult | null>(null);
  const [scientificNameAutoFilled, setScientificNameAutoFilled] = useState(false);
  const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recent detections when modal opens
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/haikubox/detections?recent=true&limit=15");
        if (res.ok) {
          const data = await res.json();
          setRecentDetections(data.detections || []);
        }
      } catch (err) {
        console.error("Failed to fetch recent detections:", err);
      }
    };
    if (isOpen) {
      fetchRecent();
    }
  }, [isOpen]);

  // Validate common name and lookup scientific name with debounce
  useEffect(() => {
    // Validate the name
    const validation = validateBirdName(newCommonName);
    setNameValidation(validation);

    // Clear previous timeout
    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
    }

    // Don't lookup if name is too short
    const nameToLookup = validation.suggestions[0] || newCommonName.trim();
    if (nameToLookup.length < 3) {
      setLookupResult(null);
      setLookupLoading(false);
      return;
    }

    // Debounce the lookup
    setLookupLoading(true);
    lookupTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/birds/lookup?name=${encodeURIComponent(nameToLookup)}`);
        if (res.ok) {
          const data: BirdLookupResult = await res.json();
          setLookupResult(data);
          // Auto-fill scientific name if not already filled manually
          if (data.scientificName && !newScientificName && !scientificNameAutoFilled) {
            setNewScientificName(data.scientificName);
            setScientificNameAutoFilled(true);
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
    }, 600);

    return () => {
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current);
      }
    };
  }, [newCommonName, newScientificName, scientificNameAutoFilled]);

  // Reset auto-fill flag when scientific name is manually cleared
  const handleScientificNameChange = (value: string) => {
    setNewScientificName(value);
    if (!value) {
      setScientificNameAutoFilled(false);
    }
  };

  // Apply name suggestion
  const applySuggestion = () => {
    if (nameValidation.suggestions[0]) {
      setNewCommonName(nameValidation.suggestions[0]);
    }
  };

  // Filter species that were recently heard
  const recentlyHeardSpecies = useMemo(() => {
    return species.filter((s) =>
      recentDetections.some((d) => d.matchedSpeciesId === s.id)
    );
  }, [species, recentDetections]);

  // Get detection data for a species
  const getDetectionForSpecies = (speciesId: number) => {
    return recentDetections.find((d) => d.matchedSpeciesId === speciesId);
  };

  if (!isOpen || !photo) return null;

  const filteredSpecies = species.filter(
    (s) =>
      s.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scientificName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async (speciesId: number) => {
    // Check if species is at the photo limit
    const targetSpecies = species.find(s => s.id === speciesId);
    if (targetSpecies && (targetSpecies.photoCount || 0) >= SPECIES_PHOTO_LIMIT) {
      // Show swap picker instead of assigning directly
      setSwapSpeciesId(speciesId);
      setSwapSelectedId(null);
      setLoadingSwapPhotos(true);
      try {
        const res = await fetch(`/api/photos?speciesId=${speciesId}&limit=${SPECIES_PHOTO_LIMIT}`);
        if (res.ok) {
          const data: PhotosResponse = await res.json();
          setSwapPhotos(data.photos);
        }
      } catch (err) {
        console.error("Failed to fetch species photos:", err);
      } finally {
        setLoadingSwapPhotos(false);
      }
      return;
    }

    // Not at limit — assign directly
    setLoading(true);
    try {
      await onAssign(photo.id, speciesId);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapConfirm = async () => {
    if (!swapSpeciesId || !swapSelectedId) return;
    setLoading(true);
    try {
      await onAssign(photo.id, swapSpeciesId, swapSelectedId);
    } finally {
      setLoading(false);
      setSwapSpeciesId(null);
      setSwapPhotos([]);
      setSwapSelectedId(null);
    }
  };

  const handleCreateAndAssign = async () => {
    if (!newCommonName.trim()) return;
    setLoading(true);
    try {
      await onCreateAndAssign(photo.id, {
        commonName: newCommonName.trim(),
        scientificName: newScientificName.trim() || undefined,
        rarity: newRarity,
      });
      setNewCommonName("");
      setNewScientificName("");
      setNewRarity("common");
      setShowNewForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--forest-950)]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--mist-100)]">
        {/* Accent top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--forest-600)] via-[var(--moss-500)] to-[var(--forest-600)]" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--mist-100)] bg-gradient-to-r from-[var(--moss-50)] to-[var(--mist-50)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--forest-900)]">
                Assign Species
              </h2>
              {queuePosition && (
                <p className="text-sm text-[var(--mist-500)]">
                  Photo {queuePosition.current} of {queuePosition.total}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--mist-400)] hover:text-[var(--mist-600)] hover:bg-white/50 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Photo preview */}
        <div className="p-4 bg-[var(--mist-50)]">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white shadow-inner">
            <Image
              src={photo.originalUrl}
              alt="Photo to assign"
              fill
              className="object-contain"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
          {photo.originalDateTaken && (
            <p className="text-sm text-[var(--mist-500)] mt-2 text-center">
              Taken: {new Date(photo.originalDateTaken).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Species selection */}
        <div className="flex-1 overflow-auto p-4">
          {swapSpeciesId ? (
            /* Swap picker view */
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={() => {
                  setSwapSpeciesId(null);
                  setSwapPhotos([]);
                  setSwapSelectedId(null);
                }}
                className="flex items-center gap-1.5 text-sm text-[var(--mist-500)] hover:text-[var(--forest-700)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to species
              </button>

              {/* Upgrade card */}
              <div className="p-4 bg-[var(--moss-50)] border border-[var(--moss-200)] rounded-xl">
                <h3 className="font-semibold text-[var(--forest-800)] mb-1">
                  Upgrade your gallery
                </h3>
                <p className="text-sm text-[var(--forest-600)]">
                  Your {species.find(s => s.id === swapSpeciesId)?.commonName} gallery is curated to {SPECIES_PHOTO_LIMIT} photos. Pick one to swap out for this new shot.
                </p>
              </div>

              {/* Swap picker */}
              {loadingSwapPhotos ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--moss-300)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <SwapPicker
                  photos={swapPhotos}
                  selectedPhotoId={swapSelectedId}
                  onSelect={setSwapSelectedId}
                  loading={loading}
                />
              )}

              {/* Confirm button */}
              <Button
                onClick={handleSwapConfirm}
                disabled={!swapSelectedId || loading}
                className="w-full"
              >
                {loading ? "Swapping..." : "Swap Photo"}
              </Button>
            </div>
          ) : !showNewForm ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Search species..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Recently Heard Section */}
              {recentlyHeardSpecies.length > 0 && !searchQuery && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-[var(--sky-600)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
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
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    Recently Heard
                  </h4>
                  <div className="space-y-2">
                    {recentlyHeardSpecies.map((s) => {
                      const detection = getDetectionForSpecies(s.id);
                      return (
                        <button
                          key={`recent-${s.id}`}
                          onClick={() => handleAssign(s.id)}
                          disabled={loading}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--sky-200)] bg-[var(--sky-50)]/50 hover:border-[var(--sky-400)] hover:bg-[var(--sky-50)] transition-all text-left disabled:opacity-50"
                        >
                          {s.latestPhoto ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[var(--sky-200)]">
                              <Image
                                src={s.latestPhoto.thumbnailUrl}
                                alt={s.commonName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--sky-100)] to-[var(--mist-50)] flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-[var(--sky-400)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[var(--forest-900)] truncate">
                                {s.commonName}
                              </p>
                              <RarityBadge rarity={s.rarity} size="sm" />
                            </div>
                            {s.scientificName && (
                              <p className="text-sm text-[var(--mist-500)] italic truncate">
                                {s.scientificName}
                              </p>
                            )}
                          </div>
                          {detection && (
                            <HeardBadge
                              count={detection.yearlyCount}
                              lastHeard={detection.lastHeardAt}
                              size="sm"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-[var(--mist-100)] my-4" />
                </div>
              )}

              {/* Species list */}
              <div className="space-y-2 mb-4">
                {filteredSpecies.length === 0 ? (
                  <p className="text-center text-[var(--mist-500)] py-4">
                    {searchQuery
                      ? "No matching species found"
                      : "No species added yet"}
                  </p>
                ) : (
                  filteredSpecies.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAssign(s.id)}
                      disabled={loading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--mist-200)] hover:border-[var(--moss-400)] hover:bg-[var(--moss-50)] transition-all text-left disabled:opacity-50"
                    >
                      {s.latestPhoto ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-[var(--mist-100)]">
                          <Image
                            src={s.latestPhoto.thumbnailUrl}
                            alt={s.commonName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[var(--mist-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[var(--forest-900)] truncate">
                            {s.commonName}
                          </p>
                          <RarityBadge rarity={s.rarity} size="sm" />
                        </div>
                        {s.scientificName && (
                          <p className="text-sm text-[var(--mist-500)] italic truncate">
                            {s.scientificName}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${
                        (s.photoCount || 0) >= SPECIES_PHOTO_LIMIT
                          ? "bg-[var(--moss-100)] text-[var(--moss-700)]"
                          : "bg-[var(--mist-50)] text-[var(--mist-400)]"
                      }`}>
                        {(s.photoCount || 0) >= SPECIES_PHOTO_LIMIT ? (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Curated
                          </>
                        ) : (
                          `${s.photoCount || 0} of ${SPECIES_PHOTO_LIMIT}`
                        )}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Add new species button */}
              <button
                onClick={() => setShowNewForm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--moss-200)] text-[var(--forest-700)] hover:border-[var(--moss-400)] hover:bg-[var(--moss-50)] transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Species
              </button>
            </>
          ) : (
            /* New species form */
            <div className="space-y-4">
              {/* Common Name with validation */}
              <div>
                <Input
                  label="Common Name *"
                  placeholder="e.g., Dark-eyed Junco"
                  value={newCommonName}
                  onChange={(e) => setNewCommonName(e.target.value)}
                  autoFocus
                />
                {/* Validation feedback */}
                {!nameValidation.isValid && nameValidation.suggestions[0] && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-700">{nameValidation.errors[0]}</p>
                        <button
                          type="button"
                          onClick={applySuggestion}
                          className="mt-1 text-sm font-medium text-amber-700 hover:text-amber-800 underline underline-offset-2"
                        >
                          Use &quot;{nameValidation.suggestions[0]}&quot;
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Lookup status */}
                {lookupLoading && newCommonName.trim().length >= 3 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--mist-500)]">
                    <div className="w-3 h-3 border-2 border-[var(--moss-300)] border-t-transparent rounded-full animate-spin" />
                    Looking up species...
                  </div>
                )}
                {lookupResult && !lookupLoading && (
                  <div className="mt-2 p-2 bg-[var(--moss-50)] border border-[var(--moss-200)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs text-[var(--moss-700)]">
                        Found: {lookupResult.scientificName ? (
                          <span className="italic">{lookupResult.scientificName}</span>
                        ) : "No scientific name found"}
                      </span>
                    </div>
                  </div>
                )}
                {!lookupResult && !lookupLoading && newCommonName.trim().length >= 3 && nameValidation.isValid && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--mist-400)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Species not found in database
                  </div>
                )}
              </div>

              {/* Scientific Name with auto-fill indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-[var(--forest-700)]">
                    Scientific Name
                  </label>
                  {scientificNameAutoFilled && (
                    <span className="text-xs text-[var(--moss-600)] flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Auto-filled
                    </span>
                  )}
                </div>
                <Input
                  placeholder="e.g., Junco hyemalis"
                  value={newScientificName}
                  onChange={(e) => handleScientificNameChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--forest-700)] mb-2">
                  Rarity
                </label>
                <div className="flex gap-2">
                  {(["common", "uncommon", "rare"] as const).map((rarity) => (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => setNewRarity(rarity)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        newRarity === rarity
                          ? rarity === "common"
                            ? "bg-slate-100 border-slate-300 text-slate-700"
                            : rarity === "uncommon"
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-[var(--mist-200)] text-[var(--mist-500)] hover:border-[var(--mist-300)]"
                      }`}
                    >
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewCommonName("");
                    setNewScientificName("");
                    setNewRarity("common");
                    setLookupResult(null);
                    setScientificNameAutoFilled(false);
                    setNameValidation({ isValid: true, suggestions: [], errors: [] });
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateAndAssign}
                  disabled={!newCommonName.trim() || loading}
                  className="flex-1"
                >
                  {loading ? "Saving..." : "Create & Assign"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with skip */}
        {showSkip && onSkip && !showNewForm && !swapSpeciesId && (
          <div className="p-4 border-t border-[var(--mist-100)] bg-[var(--mist-50)]">
            <button
              onClick={onSkip}
              className="w-full text-center text-sm text-[var(--mist-500)] hover:text-[var(--forest-700)] transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
