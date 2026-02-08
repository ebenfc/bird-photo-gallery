"use client";

import Link from "next/link";
import { getStateName } from "@/config/usStates";

interface GalleryCardProps {
  username: string;
  displayName: string;
  city: string | null;
  state: string | null;
  speciesCount: number;
  photoCount: number;
}

export default function GalleryCard({
  username,
  displayName,
  city,
  state,
  speciesCount,
  photoCount,
}: GalleryCardProps) {
  const locationParts: string[] = [];
  if (city) locationParts.push(city);
  if (state) locationParts.push(getStateName(state) || state);
  const locationText = locationParts.join(", ");

  return (
    <Link
      href={`/u/${username}`}
      className="block group"
    >
      <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--card-bg)]
        border border-[var(--border-light)] hover:border-[var(--moss-300)]
        shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
        transition-all duration-[var(--timing-fast)]">
        {/* Display Name */}
        <h3 className="font-semibold text-[var(--text-primary)] text-lg
          group-hover:text-[var(--moss-700)] transition-colors duration-[var(--timing-fast)]">
          {displayName}
        </h3>

        {/* Location */}
        {locationText && (
          <p className="text-sm text-[var(--mist-600)] mt-1 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationText}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-[var(--mist-500)]">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {speciesCount} species
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {photoCount} photos
          </span>
        </div>
      </div>
    </Link>
  );
}
