"use client";

import Image from "next/image";
import Link from "next/link";
import { Species } from "@/types";
import RarityBadge from "@/components/ui/RarityBadge";

interface SpeciesCardProps {
  species: Species;
  onEdit?: () => void;
  index?: number;
}

export default function SpeciesCard({ species, onEdit, index = 0 }: SpeciesCardProps) {
  // Use cover photo if set, otherwise fall back to latest photo
  const displayPhoto = species.coverPhoto || species.latestPhoto;
  const thumbnailUrl = displayPhoto
    ? `/uploads/thumbnails/${displayPhoto.thumbnailFilename}`
    : null;

  const animationDelay = Math.min(index * 50, 400);

  return (
    <div
      className="group bg-white rounded-[var(--radius-xl)] overflow-hidden
        shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]
        hover:shadow-[var(--shadow-xl)] hover:ring-[var(--moss-200)]
        hover:-translate-y-1
        transition-all duration-[var(--timing-normal)]
        animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image - clickable to view photos */}
      <Link href={`/species/${species.id}`}>
        <div className="aspect-[4/3] bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)]
          relative cursor-pointer overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={species.commonName}
              fill
              className="object-cover transition-transform duration-[var(--timing-slow)] ease-out
                group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--mist-300)]">
              {/* Animated bird icon for empty state */}
              <svg
                className="w-16 h-16 mb-2 animate-float"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21.5 8.5c-.5-.5-1.5-.5-2.5 0L15 12l-3-1-4.5 2.5c-1.5 1-2 2.5-1.5 4l1 2.5 1.5-1 2-1.5 3 .5 2-1.5 4-4c1-1 1-2.5 0-3.5l-2.5-2z" />
                <circle cx="18" cy="7" r="1" />
              </svg>
              <span className="text-sm font-medium">No photos yet</span>
            </div>
          )}
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-950)]/30 to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--timing-normal)]" />

          {/* Frame effect */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-t-[var(--radius-xl)]" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/species/${species.id}`} className="flex-1 min-w-0 group/link">
            <h3 className="font-bold text-[var(--forest-900)]
              group-hover/link:text-[var(--forest-700)]
              truncate transition-colors">
              {species.commonName}
            </h3>
            {species.scientificName && (
              <p className="text-sm text-[var(--mist-500)] italic truncate">
                {species.scientificName}
              </p>
            )}
          </Link>

          {/* Edit button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="p-2.5 text-[var(--mist-400)]
                hover:text-[var(--forest-700)] hover:bg-[var(--moss-50)]
                rounded-[var(--radius-md)]
                transition-all duration-[var(--timing-fast)]
                active:scale-90"
              title="Edit species"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <RarityBadge rarity={species.rarity} size="sm" />

          {/* Photo count pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1
            bg-gradient-to-br from-[var(--moss-50)] to-[var(--forest-50)]
            rounded-full shadow-[var(--shadow-xs)]">
            <svg className="w-4 h-4 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[var(--forest-700)] font-bold text-sm">
              {species.photoCount || 0}
            </span>
            <span className="text-[var(--mist-500)] text-xs">
              photo{(species.photoCount || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
