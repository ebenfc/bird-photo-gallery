"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Photo, Species, PhotosResponse } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import Button from "@/components/ui/Button";
import ActivityTimeline from "@/components/activity/ActivityTimeline";

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

  const canNavigate = selectedPhoto
    ? {
        prev: photos.findIndex((p) => p.id === selectedPhoto.id) > 0,
        next:
          photos.findIndex((p) => p.id === selectedPhoto.id) < photos.length - 1,
      }
    : { prev: false, next: false };

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/species" className="hover:text-gray-700">
          Species
        </Link>
        <span>/</span>
        <span className="text-gray-900">{species.commonName}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {species.commonName}
        </h1>
        {species.scientificName && (
          <p className="text-lg text-gray-500 italic">
            {species.scientificName}
          </p>
        )}
        <a
          href={`https://www.allaboutbirds.org/guide/${species.commonName.replace(/ /g, "_")}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-sm text-[var(--forest-600)] hover:text-[var(--forest-700)] hover:underline transition-colors"
        >
          <span>View on All About Birds</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
        {species.description && (
          <p className="mt-2 text-gray-600">{species.description}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="mb-6">
        <ActivityTimeline speciesName={species.commonName} />
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:block">
        <PhotoGrid
          photos={photos}
          onPhotoClick={setSelectedPhoto}
          showSpecies={false}
        />
      </div>

      {/* Mobile: Single column with larger photos */}
      <div className="sm:hidden space-y-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="w-full block rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-md)]
              border border-[var(--border-light)] hover:shadow-[var(--shadow-lg)]
              transition-all duration-[var(--timing-normal)] active:scale-[0.98]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative aspect-[4/3] bg-gray-100">
              <img
                src={photo.thumbnailUrl}
                alt={photo.species?.commonName || "Bird photo"}
                className="w-full h-full object-cover"
              />
              {photo.isFavorite && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm
                  shadow-[var(--shadow-sm)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onFavoriteToggle={handleFavoriteToggle}
        onNavigate={handleNavigate}
        canNavigate={canNavigate}
        defaultToFullscreen={true}
      />
    </div>
  );
}
