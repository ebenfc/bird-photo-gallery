"use client";

import { useState } from "react";
import Image from "next/image";
import { Photo, Species } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SpeciesAssignModalProps {
  photo: Photo | null;
  species: Species[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (photoId: number, speciesId: number) => Promise<void>;
  onCreateAndAssign: (
    photoId: number,
    speciesData: { commonName: string; scientificName?: string }
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
  const [loading, setLoading] = useState(false);

  if (!isOpen || !photo) return null;

  const filteredSpecies = species.filter(
    (s) =>
      s.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scientificName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async (speciesId: number) => {
    setLoading(true);
    try {
      await onAssign(photo.id, speciesId);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAssign = async () => {
    if (!newCommonName.trim()) return;
    setLoading(true);
    try {
      await onCreateAndAssign(photo.id, {
        commonName: newCommonName.trim(),
        scientificName: newScientificName.trim() || undefined,
      });
      setNewCommonName("");
      setNewScientificName("");
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
          {!showNewForm ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <Input
                  placeholder="Search species..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

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
                            src={`/uploads/thumbnails/${s.latestPhoto.thumbnailFilename}`}
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
                        <p className="font-medium text-[var(--forest-900)] truncate">
                          {s.commonName}
                        </p>
                        {s.scientificName && (
                          <p className="text-sm text-[var(--mist-500)] italic truncate">
                            {s.scientificName}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-[var(--mist-400)] px-2 py-1 bg-[var(--mist-50)] rounded-full">
                        {s.photoCount || 0}
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
              <Input
                label="Common Name *"
                placeholder="e.g., Dark-eyed Junco"
                value={newCommonName}
                onChange={(e) => setNewCommonName(e.target.value)}
                autoFocus
              />
              <Input
                label="Scientific Name (optional)"
                placeholder="e.g., Junco hyemalis"
                value={newScientificName}
                onChange={(e) => setNewScientificName(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewCommonName("");
                    setNewScientificName("");
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
        {showSkip && onSkip && !showNewForm && (
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
