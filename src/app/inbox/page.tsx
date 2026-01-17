"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Photo, Species, SpeciesResponse } from "@/types";
import SpeciesAssignModal from "@/components/species/SpeciesAssignModal";
import Button from "@/components/ui/Button";

interface UnassignedResponse {
  count: number;
  photos: Photo[];
}

export default function InboxPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchData = async () => {
    try {
      const [photosRes, speciesRes] = await Promise.all([
        fetch("/api/photos/unassigned"),
        fetch("/api/species"),
      ]);
      const photosData: UnassignedResponse = await photosRes.json();
      const speciesData: SpeciesResponse = await speciesRes.json();
      setPhotos(photosData.photos);
      setSpecies(speciesData.species);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPhoto = photos[currentIndex] || null;

  const handleAssign = async (photoId: number, speciesId: number) => {
    await fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speciesId }),
    });

    // Remove from list and move to next
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (currentIndex >= photos.length - 1) {
      setCurrentIndex(Math.max(0, photos.length - 2));
    }
    setShowAssignModal(false);
  };

  const handleCreateAndAssign = async (
    photoId: number,
    speciesData: { commonName: string; scientificName?: string }
  ) => {
    // Create species
    const createRes = await fetch("/api/species", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(speciesData),
    });
    const { species: newSpecies } = await createRes.json();

    // Assign to photo
    await handleAssign(photoId, newSpecies.id);

    // Refresh species list
    const speciesRes = await fetch("/api/species");
    const speciesListData: SpeciesResponse = await speciesRes.json();
    setSpecies(speciesListData.species);
  };

  const handleSkip = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setShowAssignModal(false);
  };

  const startAssigning = () => {
    setCurrentIndex(0);
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="pnw-texture min-h-screen">
        <div className="h-8 w-48 bg-gradient-to-r from-[var(--moss-100)] to-[var(--mist-100)] rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pnw-texture min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--forest-900)]">Inbox</h1>
          <p className="text-[var(--mist-500)] mt-1">
            {photos.length === 0
              ? "All caught up! No photos need assignment."
              : `${photos.length} photo${photos.length !== 1 ? "s" : ""} waiting for species assignment`}
          </p>
        </div>
        {photos.length > 0 && (
          <Button onClick={startAssigning}>
            Start Assigning
          </Button>
        )}
      </div>

      {/* Empty state */}
      {photos.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-[var(--mist-100)] shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--forest-800)] mb-2">
            All photos assigned!
          </h3>
          <p className="text-[var(--mist-500)] mb-6 max-w-sm mx-auto">
            Upload more photos to see them here
          </p>
          <Link href="/">
            <Button variant="secondary">View Gallery</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowAssignModal(true);
                }}
                className="group relative aspect-square bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] rounded-2xl overflow-hidden
                  ring-1 ring-[var(--mist-100)] hover:ring-2 hover:ring-[var(--moss-400)] hover:shadow-lg transition-all duration-300"
              >
                <Image
                  src={photo.thumbnailUrl}
                  alt="Unassigned photo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-[var(--forest-950)]/0 group-hover:bg-[var(--forest-950)]/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[var(--forest-800)] px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                    Assign Species
                  </span>
                </div>
                <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                  #{index + 1}
                </div>
              </button>
            ))}
          </div>

          {/* Quick tip */}
          <div className="mt-8 p-4 bg-[var(--sky-50)] rounded-xl border border-[var(--sky-100)]">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--sky-600)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[var(--sky-800)]">
                <strong>Tip:</strong> Click "Start Assigning" to go through your photos one by one,
                or click any photo to assign it individually.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Assignment modal */}
      <SpeciesAssignModal
        photo={currentPhoto}
        species={species}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
        onCreateAndAssign={handleCreateAndAssign}
        onSkip={handleSkip}
        showSkip={photos.length > 1}
        queuePosition={
          photos.length > 0
            ? { current: currentIndex + 1, total: photos.length }
            : undefined
        }
      />
    </div>
  );
}
