"use client";

import Link from "next/link";
import { CHANGELOG, type ChangeCategory } from "@/data/changelog";

const CATEGORY_CONFIG: Record<
  ChangeCategory,
  { label: string; className: string }
> = {
  feature: {
    label: "New",
    className:
      "bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]",
  },
  improvement: {
    label: "Improved",
    className:
      "bg-gradient-to-br from-[var(--amber-50)] to-[var(--amber-100)] text-[var(--amber-700)] border-[var(--amber-300)]",
  },
  fix: {
    label: "Fixed",
    className:
      "bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function WhatsNewPage() {
  return (
    <div className="pnw-texture min-h-screen pb-24 sm:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
          What&apos;s New
        </h1>
        <p className="text-[var(--mist-600)]">
          Recent features, improvements, and fixes in Bird Feed.
        </p>
      </div>

      {/* Release entries */}
      <div className="space-y-8">
        {CHANGELOG.map((release) => (
          <section
            key={release.date}
            className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
              border border-[var(--border-light)] overflow-hidden"
          >
            {/* Release header */}
            <div
              className="bg-gradient-to-r from-[var(--surface-moss)] to-[var(--surface-forest)]
                border-b border-[var(--border-light)] px-5 sm:px-6 py-4"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-[var(--moss-600)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                {release.title}
              </h2>
              <p className="text-sm text-[var(--mist-600)]">
                <time dateTime={release.date}>{formatDate(release.date)}</time>
              </p>
            </div>

            {/* Changes list */}
            <div className="p-5 sm:p-6">
              <ul className="space-y-3">
                {release.changes.map((change, idx) => {
                  const config = CATEGORY_CONFIG[change.category];
                  return (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 sm:p-4 rounded-[var(--radius-md)]
                        bg-[var(--mist-50)] border border-[var(--border-light)]"
                    >
                      <span
                        className={`inline-flex items-center flex-shrink-0 px-2.5 py-0.5
                          text-xs font-semibold rounded-full border ${config.className}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-sm sm:text-base text-[var(--mist-700)] leading-relaxed">
                        {change.description}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>

      {/* Back to About link */}
      <div className="mt-8 text-center">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-sm font-medium
            text-[var(--moss-600)] hover:text-[var(--moss-700)]
            transition-colors duration-[var(--timing-fast)]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to About
        </Link>
      </div>
    </div>
  );
}
