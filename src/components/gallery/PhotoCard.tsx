"use client";

import Image from "next/image";
import { Photo } from "@/types";

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  showSpecies?: boolean;
  index?: number;
}

export default function PhotoCard({
  photo,
  onClick,
  showSpecies = true,
  index = 0,
}: PhotoCardProps) {
  // Stagger animation delay based on index
  const animationDelay = Math.min(index * 50, 400);

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative aspect-square rounded-[var(--radius-xl)] overflow-hidden cursor-pointer
        bg-gradient-to-br from-[var(--surface-moss)] to-[var(--mist-50)]
        shadow-[var(--shadow-sm)]
        ring-1 ring-[var(--border)]
        transition-all duration-[var(--timing-normal)]
        hover:shadow-[var(--shadow-xl)] hover:ring-2 hover:ring-[var(--moss-300)]
        hover:-translate-y-1
        active:scale-[0.98] active:shadow-[var(--shadow-md)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--moss-500)]
        animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      aria-label={`View ${photo.species?.commonName || "bird"} photo${photo.isFavorite ? " (favorited)" : ""}`}
    >
      <Image
        src={photo.thumbnailUrl}
        alt={photo.species?.commonName || "Bird photo"}
        fill
        className="object-cover transition-transform duration-[var(--timing-slow)] ease-out
          group-hover:scale-[1.05]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Subtle frame effect */}
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[var(--radius-xl)]" />

      {/* Favorite badge with animation */}
      {photo.isFavorite && (
        <div className="absolute top-2.5 right-2.5 bg-[var(--card-bg)]/95 backdrop-blur-sm rounded-full p-1.5
          shadow-[var(--shadow-md)] ring-1 ring-white/50
          transition-transform duration-[var(--timing-fast)]
          group-hover:scale-110">
          <svg
            className="w-4 h-4 text-red-500 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Species name overlay - elegant reveal */}
      {showSpecies && photo.species && (
        <div className="absolute bottom-0 left-0 right-0
          bg-gradient-to-t from-[var(--forest-950)]/90 via-[var(--forest-950)]/60 to-transparent
          p-3.5 pt-12
          opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
          transition-all duration-[var(--timing-normal)]">
          <p className="text-white text-sm font-semibold truncate drop-shadow-sm">
            {photo.species.commonName}
          </p>
          {photo.species.scientificName && (
            <p className="text-white/75 text-xs italic truncate">
              {photo.species.scientificName}
            </p>
          )}
        </div>
      )}

      {/* Unassigned indicator with modern style */}
      {!photo.species && (
        <div className="absolute top-2.5 left-2.5
          bg-gradient-to-r from-[var(--mist-400)] to-[var(--mist-500)]
          text-white text-xs font-bold px-3 py-1.5
          rounded-full shadow-[var(--shadow-md)]
          transition-transform duration-[var(--timing-fast)]
          group-hover:scale-105">
          Unassigned
        </div>
      )}
    </div>
  );
}
