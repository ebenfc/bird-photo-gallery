"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Photo, Species, PhotosResponse, HaikuboxDetection } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import Button from "@/components/ui/Button";
import RarityBadge from "@/components/ui/RarityBadge";
import HeardBadge from "@/components/ui/HeardBadge";
import ActivityTimeline from "@/components/activity/ActivityTimeline";
import { SPECIES_PHOTO_LIMIT } from "@/config/limits";

interface SpeciesPageProps {
  params: Promise<{ id: string }>;
}

export default function SpeciesPhotos({ params }: SpeciesPageProps) {
  const { id } = use(params);
  const speciesId = parseInt(id);

  const [species, setSpecies] = useState<Species | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [detection, setDetection] = useState<HaikuboxDetection | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch species info
        const speciesRes = await fetch(`/api/species/${speciesId}`);
        const speciesData = await speciesRes.json();
        setSpecies(speciesData.species);

        // Fetch photos for this species
        const photosRes = await fetch(`/api/photos?speciesId=${speciesId}`);
        const photosData: PhotosResponse = await photosRes.json();
        setPhotos(photosData.photos);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [speciesId]);

  // Fetch Haikubox detection data for this species
  useEffect(() => {
    const fetchDetection = async () => {
      if (!species?.commonName) return;

      try {
        const res = await fetch(`/api/haikubox/detections?species=${encodeURIComponent(species.commonName)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.detections && data.detections.length > 0) {
            setDetection(data.detections[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch detection:", err);
      }
    };

    fetchDetection();
  }, [species?.commonName]);

  const handleFavoriteToggle = async (id: number, isFavorite: boolean) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });

      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite } : p))
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto((prev) => (prev ? { ...prev, isFavorite } : null));
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  const handleDateChange = async (id: number, date: string | null) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalDateTaken: date }),
      });

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, originalDateTaken: date, dateTakenSource: "manual" as const }
            : p
        )
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto((prev) =>
          prev ? { ...prev, originalDateTaken: date, dateTakenSource: "manual" as const } : null
        );
      }
    } catch (err) {
      console.error("Failed to update date:", err);
    }
  };

  const handleNotesChange = async (id: number, notes: string | null) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, notes } : p))
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto((prev) => (prev ? { ...prev, notes } : null));
      }
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "DELETE",
      });

      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  const handleSetCoverPhoto = async (photoId: number, speciesId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/species/${speciesId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhotoId: photoId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to set cover photo:", errorData.error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Failed to set cover photo:", err);
      return false;
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < photos.length) {
      const newPhoto = photos[newIndex];
      if (newPhoto) {
        setSelectedPhoto(newPhoto);
      }
    }
  };

  const currentPhotoIndex = selectedPhoto
    ? photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const canNavigate = selectedPhoto
    ? {
        prev: currentPhotoIndex > 0,
        next: currentPhotoIndex < photos.length - 1,
      }
    : { prev: false, next: false };

  const adjacentPhotos = selectedPhoto && currentPhotoIndex >= 0
    ? {
        prev: currentPhotoIndex > 0
          ? { originalUrl: photos[currentPhotoIndex - 1]!.originalUrl, alt: photos[currentPhotoIndex - 1]!.species?.commonName || "Bird photo" }
          : null,
        next: currentPhotoIndex < photos.length - 1
          ? { originalUrl: photos[currentPhotoIndex + 1]!.originalUrl, alt: photos[currentPhotoIndex + 1]!.species?.commonName || "Bird photo" }
          : null,
      }
    : undefined;

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-[var(--mist-200)] rounded-[var(--radius-md)] animate-pulse mb-6" />
        <div className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] border border-[var(--border-light)] p-5 sm:p-6 mb-6">
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-[var(--mist-200)] rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-[var(--mist-100)] rounded animate-pulse" />
            <div className="h-4 w-full bg-[var(--mist-100)] rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-[var(--surface-moss)] to-[var(--mist-50)] rounded-[var(--radius-lg)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Species not found
        </h2>
        <Link href="/species">
          <Button variant="secondary">Back to Species</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/species"
        className="inline-flex items-center gap-2 text-sm text-[var(--mist-600)]
          hover:text-[var(--forest-700)] mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to species
      </Link>

      {/* Species Header Card */}
      <div className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] border border-[var(--border-light)]
        p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
              {species.commonName}
            </h1>
            {species.scientificName && (
              <p className="text-[var(--mist-500)] italic mb-3">
                {species.scientificName}
              </p>
            )}
            {species.description && (
              <p className="text-[var(--mist-600)] leading-relaxed max-w-2xl">
                {species.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <RarityBadge rarity={species.rarity} />
            {detection && detection.yearlyCount > 0 && (
              <HeardBadge
                count={detection.yearlyCount}
                lastHeard={detection.lastHeardAt}
                size="md"
              />
            )}
          </div>
        </div>

        {/* External link */}
        <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
          <a
            href={`https://www.allaboutbirds.org/guide/${species.commonName.replace(/\s+/g, "_")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--forest-600)]
              hover:text-[var(--moss-600)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Learn more at All About Birds
          </a>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mb-6">
        <ActivityTimeline speciesName={species.commonName} />
      </div>

      {/* Photo count */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {photos.length >= SPECIES_PHOTO_LIMIT
              ? "Your Gallery — Curated"
              : `Your Gallery (${photos.length} of ${SPECIES_PHOTO_LIMIT})`}
          </h2>
          {photos.length >= SPECIES_PHOTO_LIMIT && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--moss-100)] text-[var(--moss-700)] text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {SPECIES_PHOTO_LIMIT} of {SPECIES_PHOTO_LIMIT}
            </span>
          )}
        </div>
        {photos.length >= SPECIES_PHOTO_LIMIT && (
          <p className="text-sm text-[var(--mist-500)] mt-1">
            Showing your {SPECIES_PHOTO_LIMIT} best shots. Upload a new photo to swap one out.
          </p>
        )}
      </div>

      {/* Photo Grid - same layout for mobile and desktop */}
      <PhotoGrid
        photos={photos}
        onPhotoClick={setSelectedPhoto}
        showSpecies={false}
      />

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mist-100)]
            flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--mist-400)]"
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
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Start your collection
          </h3>
          <p className="text-[var(--mist-600)]">
            Room for {SPECIES_PHOTO_LIMIT} of your best shots. Upload photos and assign them to this species.
          </p>
        </div>
      )}

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onFavoriteToggle={handleFavoriteToggle}
        onNavigate={handleNavigate}
        canNavigate={canNavigate}
        adjacentPhotos={adjacentPhotos}
        onDateChange={handleDateChange}
        onNotesChange={handleNotesChange}
        onDelete={handleDelete}
        onSetCoverPhoto={handleSetCoverPhoto}
        defaultToFullscreen={false}
      />
    </div>
  );
}
