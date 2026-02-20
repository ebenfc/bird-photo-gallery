"use client";

import type { WishListItem } from "@/types";

interface WishListCardProps {
  item: WishListItem;
  onEdit?: () => void;
}

export default function WishListCard({ item, onEdit }: WishListCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimestamp = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
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
        {/* eBird link badge — only for eBird-sourced items */}
        {item.source === "ebird" && item.ebirdSpeciesCode && (
          <a
            href={`https://ebird.org/species/${item.ebirdSpeciesCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 px-2 py-1 rounded-[var(--radius-md)]
              bg-[var(--card-bg)]/90 backdrop-blur-sm
              text-xs font-medium text-[var(--moss-700)]
              hover:bg-[var(--card-bg)] hover:text-[var(--forest-700)]
              transition-all duration-[var(--timing-fast)]
              shadow-[var(--shadow-xs)]"
            aria-label={`View ${item.commonName} on eBird`}
          >
            eBird
          </a>
        )}
        {/* Edit button — only for manual-sourced items */}
        {item.source === "manual" && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 right-2 p-2 rounded-[var(--radius-md)]
              bg-[var(--card-bg)]/90 backdrop-blur-sm
              text-[var(--mist-500)] hover:text-[var(--forest-700)] hover:bg-[var(--card-bg)]
              transition-all duration-[var(--timing-fast)]
              shadow-[var(--shadow-xs)]"
            aria-label={`Edit ${item.commonName}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Species name */}
        <h3 className="font-semibold text-[var(--text-primary)] truncate">
          {item.commonName}
        </h3>
        {item.scientificName && (
          <p className="text-sm text-[var(--mist-500)] italic truncate mt-0.5">
            {item.scientificName}
          </p>
        )}

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Date badge */}
          {item.source === "ebird" && item.firstObservedDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)]
              bg-[var(--mist-100)] text-[var(--mist-600)] text-xs font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              First seen {formatDate(item.firstObservedDate)}
            </span>
          )}
          {item.source === "manual" && item.createdAt && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-full)]
              bg-[var(--mist-100)] text-[var(--mist-600)] text-xs font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              Added {formatTimestamp(item.createdAt)}
            </span>
          )}
          {/* Not yet photographed badge — both sources */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-full)]
            bg-[var(--amber-100)] text-[var(--amber-700)] text-xs font-medium">
            Not yet photographed
          </span>
        </div>
      </div>
    </div>
  );
}
