"use client";

import Image from "next/image";
import Link from "next/link";
import type {
  TimelineEvent,
  PhotoTimelineEvent,
  EbirdTimelineEvent,
  HaikuboxTimelineEvent,
} from "@/types";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

// --- Shared card wrapper ---

function CardWrapper({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const className = `bg-[var(--card-bg)] rounded-[var(--radius-lg)]
    border border-[var(--border-light)] p-4 flex items-start gap-4
    transition-all duration-[var(--timing-fast)]
    hover:shadow-[var(--shadow-md)] hover:border-[var(--border)]`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

// --- Photo card ---

function PhotoEventCard({ event }: { event: PhotoTimelineEvent }) {
  const time = timeFormatter.format(new Date(event.eventDate));
  const href = event.speciesId ? `/species/${event.speciesId}` : undefined;

  return (
    <CardWrapper href={href}>
      <div className="relative w-14 h-14 rounded-[var(--radius-md)] overflow-hidden
        flex-shrink-0 bg-[var(--mist-100)]">
        <Image
          src={event.thumbnailUrl}
          alt={event.speciesName || "Photo"}
          fill
          className="object-cover"
          sizes="56px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[var(--text-primary)] truncate">
            {event.speciesName || "Unassigned"}
          </p>
          {event.isFavorite && (
            <svg
              className="w-4 h-4 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="var(--favorite-color)"
              aria-label="Favorite"
            >
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Photo taken</span>
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          {event.usedUploadDate ? (
            <span className="italic">Uploaded {time}</span>
          ) : (
            time
          )}
        </p>
      </div>
    </CardWrapper>
  );
}

// --- eBird lifer card ---

function EbirdEventCard({ event }: { event: EbirdTimelineEvent }) {
  return (
    <CardWrapper>
      <div className="w-14 h-14 rounded-[var(--radius-md)] flex-shrink-0
        bg-[var(--sky-100)] flex items-center justify-center">
        <svg
          className="w-7 h-7 text-[var(--sky-700)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--text-primary)] truncate">
          {event.commonName}
        </p>
        <p className="text-sm text-[var(--sky-600)] flex items-center gap-1.5 mt-0.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5l7 7-7 7" />
          </svg>
          <span>Added to eBird life list</span>
        </p>
        {event.scientificName && (
          <p className="text-xs text-[var(--text-tertiary)] italic mt-1">
            {event.scientificName}
          </p>
        )}
        <a
          href={`https://ebird.org/species/${event.speciesCode}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium
            px-2 py-0.5 rounded-full
            bg-[var(--sky-100)] text-[var(--sky-700)]
            hover:bg-[var(--sky-200)] transition-colors"
        >
          eBird
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </CardWrapper>
  );
}

// --- Haikubox detection card ---

function HaikuboxEventCard({ event }: { event: HaikuboxTimelineEvent }) {
  const href = event.speciesId ? "/haikubox" : undefined;

  return (
    <CardWrapper href={href}>
      <div className="w-14 h-14 rounded-[var(--radius-md)] flex-shrink-0
        bg-[var(--amber-100)] flex items-center justify-center">
        <svg
          className="w-7 h-7 text-[var(--amber-700)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--text-primary)] truncate">
          {event.speciesCommonName}
        </p>
        <p className="text-sm text-[var(--amber-700)] flex items-center gap-1.5 mt-0.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span>Heard via Haikubox</span>
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          {event.detectionCount === 1
            ? "1 detection this day"
            : `${event.detectionCount} detections this day`}
        </p>
      </div>
    </CardWrapper>
  );
}

// --- Dispatcher ---

export default function TimelineEventCard({ event }: { event: TimelineEvent }) {
  switch (event.type) {
    case "photo":
      return <PhotoEventCard event={event} />;
    case "ebird_lifer":
      return <EbirdEventCard event={event} />;
    case "haikubox":
      return <HaikuboxEventCard event={event} />;
  }
}
