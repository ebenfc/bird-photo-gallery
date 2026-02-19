"use client";

import type { EbirdLifeListEntry } from "@/types";

interface WishListCardProps {
  entry: EbirdLifeListEntry;
}

export default function WishListCard({ entry }: WishListCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-[var(--card-bg)] rounded-[var(--radius-xl)] overflow-hidden
        shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]
        hover:shadow-[var(--shadow-md)] hover:ring-[var(--moss-300)]
        transition-all duration-[var(--timing-fast)]"
    >
      {/* Placeholder gradient instead of photo */}
      <div className="aspect-[4/3] bg-gradient-to-br from-[var(--surface-moss)] to-[var(--mist-100)]
        flex items-center justify-center relative">
        <svg
          className="w-16 h-16 text-[var(--mist-300)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {/* eBird link badge */}
        {entry.speciesCode && (
          <a
            href={`https://ebird.org/species/${entry.speciesCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 px-2 py-1 rounded-[var(--radius-md)]
              bg-[var(--card-bg)]/90 backdrop-blur-sm
              text-xs font-medium text-[var(--moss-700)]
              hover:bg-[var(--card-bg)] hover:text-[var(--forest-700)]
              transition-all duration-[var(--timing-fast)]
              shadow-[var(--shadow-xs)]"
            aria-label={`View ${entry.commonName} on eBird`}
          >
            eBird
          </a>
        )}
      </div>

      <div className="p-4">
        {/* Species name */}
        <h3 className="font-semibold text-[var(--text-primary)] truncate">
          {entry.commonName}
        </h3>
        {entry.scientificName && (
          <p className="text-sm text-[var(--mist-500)] italic truncate mt-0.5">
            {entry.scientificName}
          </p>
        )}

        {/* First observed date */}
        <div className="mt-3 flex items-center gap-2">
          {entry.firstObservedDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)]
              bg-[var(--mist-100)] text-[var(--mist-600)] text-xs font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              First seen {formatDate(entry.firstObservedDate)}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-full)]
            bg-[var(--amber-100)] text-[var(--amber-700)] text-xs font-medium">
            Not yet photographed
          </span>
        </div>
      </div>
    </div>
  );
}
