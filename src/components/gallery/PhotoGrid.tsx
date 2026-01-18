"use client";

import { Photo } from "@/types";
import PhotoCard from "./PhotoCard";

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  loading?: boolean;
  showSpecies?: boolean;
}

export default function PhotoGrid({
  photos,
  onPhotoClick,
  loading = false,
  showSpecies = true,
}: PhotoGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-[var(--radius-xl)] skeleton"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        {/* Friendly bird illustration */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--moss-100)] to-[var(--mist-100)] rounded-full" />
          <svg
            className="absolute inset-0 w-full h-full p-5 text-[var(--forest-600)] animate-bird-hop"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21.5 8.5c-.5-.5-1.5-.5-2.5 0L15 12l-3-1-4.5 2.5c-1.5 1-2 2.5-1.5 4l1 2.5 1.5-1 2-1.5 3 .5 2-1.5 4-4c1-1 1-2.5 0-3.5l-2.5-2z" />
            <circle cx="18" cy="7" r="1.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[var(--forest-900)] mb-2">
          No photos yet
        </h3>
        <p className="text-[var(--mist-500)] text-base max-w-sm mx-auto">
          Time to go birding! Upload your first sighting to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onPhotoClick(photo)}
          showSpecies={showSpecies}
          index={index}
        />
      ))}
    </div>
  );
}
