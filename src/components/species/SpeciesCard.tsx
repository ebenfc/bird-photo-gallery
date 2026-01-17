"use client";

import Image from "next/image";
import Link from "next/link";
import { Species } from "@/types";

interface SpeciesCardProps {
  species: Species;
  onEdit?: () => void;
}

export default function SpeciesCard({ species, onEdit }: SpeciesCardProps) {
  const thumbnailUrl = species.latestPhoto
    ? `/uploads/thumbnails/${species.latestPhoto.thumbnailFilename}`
    : null;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden hover:shadow-lg hover:border-[var(--moss-200)] transition-all duration-300">
      {/* Image - clickable to view photos */}
      <Link href={`/species/${species.id}`}>
        <div className="aspect-[4/3] bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] relative cursor-pointer overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={species.commonName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--mist-300)]">
              {/* Stylized bird icon */}
              <svg
                className="w-16 h-16 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">No photos yet</span>
            </div>
          )}
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-950)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/species/${species.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--forest-900)] hover:text-[var(--forest-700)] truncate transition-colors">
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
              className="p-2 text-[var(--mist-400)] hover:text-[var(--forest-700)] hover:bg-[var(--moss-50)] rounded-xl transition-all"
              title="Edit species"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-[var(--mist-600)]">
          <div className="flex items-center gap-1 px-2 py-1 bg-[var(--moss-50)] rounded-full">
            <svg
              className="w-4 h-4 text-[var(--moss-600)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[var(--forest-700)] font-medium">
              {species.photoCount || 0}
            </span>
            <span className="text-[var(--mist-500)]">
              photo{(species.photoCount || 0) !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
