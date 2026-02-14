"use client";

interface AllAboutBirdsLinkProps {
  commonName: string;
  /** Compact mode: shorter text, no border. Used in PhotoModal. */
  compact?: boolean;
}

export default function AllAboutBirdsLink({ commonName, compact = false }: AllAboutBirdsLinkProps) {
  const url = `https://www.allaboutbirds.org/guide/${commonName.replace(/\s+/g, "_")}`;

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--forest-600)]
          hover:text-[var(--moss-600)] transition-colors"
      >
        All About Birds
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-[var(--forest-600)]
          hover:text-[var(--moss-600)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Learn more at All About Birds
      </a>
    </div>
  );
}
