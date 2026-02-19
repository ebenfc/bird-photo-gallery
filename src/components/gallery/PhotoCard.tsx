"use client";

import Image from "next/image";
import { Photo } from "@/types";

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
  showSpecies?: boolean;
  index?: number;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: () => void;
}

export default function PhotoCard({
  photo,
  onClick,
  showSpecies = true,
  index = 0,
  isSelectMode = false,
  isSelected = false,
  onSelectToggle,
}: PhotoCardProps) {
  // Stagger animation delay based on index
  const animationDelay = Math.min(index * 50, 400);

  const handleClick = () => {
    if (isSelectMode && onSelectToggle) {
      onSelectToggle();
    } else {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const speciesName = photo.species?.commonName || "bird";
  const ariaLabel = isSelectMode
    ? `${isSelected ? "Deselect" : "Select"} ${speciesName} photo${isSelected ? " (selected)" : ""}`
    : `View ${speciesName} photo${photo.isFavorite ? " (favorited)" : ""}`;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative aspect-square rounded-[var(--radius-xl)] overflow-hidden cursor-pointer
        bg-gradient-to-br from-[var(--surface-moss)] to-[var(--mist-50)]
        shadow-[var(--shadow-sm)]
        transition-all duration-[var(--timing-normal)]
        hover:shadow-[var(--shadow-xl)]
        hover:-translate-y-1
        active:scale-[0.98] active:shadow-[var(--shadow-md)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--moss-500)]
        animate-fade-in-up
        ${isSelected
          ? "ring-3 ring-[var(--moss-500)] shadow-[var(--shadow-moss-lg)]"
          : "ring-1 ring-[var(--border)] hover:ring-2 hover:ring-[var(--moss-300)]"
        }`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isSelectMode ? isSelected : undefined}
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

      {/* Selection checkbox overlay */}
      {isSelectMode && (
        <div
          className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center
            transition-all duration-[var(--timing-fast)] z-10
            ${isSelected
              ? "bg-[var(--moss-500)] border-2 border-white shadow-[var(--shadow-md)]"
              : "border-2 border-white/80 bg-black/20 backdrop-blur-sm"
            }`}
        >
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Favorite badge with animation */}
      {photo.isFavorite && (
        <div className="absolute top-2.5 right-2.5 bg-[var(--card-bg)]/95 backdrop-blur-sm rounded-full p-1.5
          shadow-[var(--shadow-md)] ring-1 ring-white/50
          transition-transform duration-[var(--timing-fast)]
          group-hover:scale-110">
          <svg
            className="w-4 h-4 text-[var(--favorite-color)] fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Species name overlay - elegant reveal */}
      {showSpecies && photo.species && (
        <div className="absolute bottom-0 left-0 right-0
          bg-gradient-to-t from-[var(--header-from)]/90 via-[var(--header-from)]/60 to-transparent
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
      {!photo.species && !isSelectMode && (
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
