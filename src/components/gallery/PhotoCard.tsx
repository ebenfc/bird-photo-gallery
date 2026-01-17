"use client";

import Image from "next/image";
import { Photo } from "@/types";

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  showSpecies?: boolean;
}

export default function PhotoCard({
  photo,
  onClick,
  showSpecies = true,
}: PhotoCardProps) {
  return (
    <div
      className="group relative aspect-square bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] rounded-2xl overflow-hidden cursor-pointer
        ring-1 ring-[var(--mist-100)] hover:ring-2 hover:ring-[var(--moss-400)] hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <Image
        src={photo.thumbnailUrl}
        alt={photo.species?.commonName || "Bird photo"}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Favorite badge */}
      {photo.isFavorite && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md ring-1 ring-white/50">
          <svg
            className="w-4 h-4 text-red-500 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Species name overlay */}
      {showSpecies && photo.species && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--forest-950)]/80 to-transparent p-3 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-medium truncate">
            {photo.species.commonName}
          </p>
          {photo.species.scientificName && (
            <p className="text-white/70 text-xs italic truncate">
              {photo.species.scientificName}
            </p>
          )}
        </div>
      )}

      {/* Unassigned indicator */}
      {!photo.species && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
          Unassigned
        </div>
      )}
    </div>
  );
}
