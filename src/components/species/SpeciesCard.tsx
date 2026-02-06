"use client";

import Image from "next/image";
import Link from "next/link";
import { Species } from "@/types";
import RarityBadge from "@/components/ui/RarityBadge";
import HeardBadge from "@/components/ui/HeardBadge";
import { SPECIES_PHOTO_LIMIT } from "@/config/limits";

interface SpeciesCardProps {
  species: Species;
  onEdit?: () => void;
  index?: number;
  linkPrefix?: string;
}

export default function SpeciesCard({ species, onEdit, index = 0, linkPrefix = "/species" }: SpeciesCardProps) {
  // Use cover photo if set, otherwise fall back to latest photo
  const displayPhoto = species.coverPhoto || species.latestPhoto;
  const thumbnailUrl = displayPhoto?.thumbnailUrl || null;

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
      <Link href={`${linkPrefix}/${species.id}`}>
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
              {/* Generic bird silhouette for empty state */}
              <svg
                className="w-16 h-16 mb-2 animate-float"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3C10.5 3 9 4 8.5 5.5C8 7 8 8.5 8.5 10C7 10.5 5.5 11 4 11C3 11 2 11.5 2 12.5C2 13 2.5 13.5 3 13.5C4 13.5 5 13 6 12.5C7 14.5 8.5 16 10.5 17C10 17.5 9 18 8.5 19C8 19.5 8 20 8.5 20.5C9 21 9.5 21 10 20.5C11 19.5 12 18.5 13 18C14 18.5 15 19 15.5 19C14.5 17.5 14 16.5 14 15.5C16 14 18 12 19 9.5C19.5 8 20 6.5 19.5 5C19 3.5 17.5 2.5 16 3C14.5 3.5 13.5 4.5 13 6C12.5 5 12.5 4 12 3Z" />
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
          <Link href={`${linkPrefix}/${species.id}`} className="flex-1 min-w-0 group/link">
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
              aria-label="Edit species"
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

          {/* Haikubox heard badge */}
          {species.haikuboxYearlyCount && species.haikuboxYearlyCount > 0 && (
            <HeardBadge
              count={species.haikuboxYearlyCount}
              lastHeard={species.haikuboxLastHeard}
              size="sm"
            />
          )}

          {/* Photo count pill */}
          {(species.photoCount || 0) >= SPECIES_PHOTO_LIMIT ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1
              bg-gradient-to-br from-[var(--moss-100)] to-[var(--moss-50)]
              rounded-full shadow-[var(--shadow-xs)]">
              <svg className="w-3.5 h-3.5 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[var(--moss-700)] font-semibold text-xs">
                Curated
              </span>
            </div>
          ) : (
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
                of {SPECIES_PHOTO_LIMIT}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
