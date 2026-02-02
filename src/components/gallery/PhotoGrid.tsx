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
            {/* Generic bird silhouette - simple songbird profile */}
            <path d="M12 3C10.5 3 9 4 8.5 5.5C8 7 8 8.5 8.5 10C7 10.5 5.5 11 4 11C3 11 2 11.5 2 12.5C2 13 2.5 13.5 3 13.5C4 13.5 5 13 6 12.5C7 14.5 8.5 16 10.5 17C10 17.5 9 18 8.5 19C8 19.5 8 20 8.5 20.5C9 21 9.5 21 10 20.5C11 19.5 12 18.5 13 18C14 18.5 15 19 15.5 19C14.5 17.5 14 16.5 14 15.5C16 14 18 12 19 9.5C19.5 8 20 6.5 19.5 5C19 3.5 17.5 2.5 16 3C14.5 3.5 13.5 4.5 13 6C12.5 5 12.5 4 12 3Z" />
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
