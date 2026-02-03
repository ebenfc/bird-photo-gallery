"use client";

// Error boundaries must be Client Components
// This component catches errors in the component tree and displays a fallback UI

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-2xl font-semibold text-[var(--forest-900)] mb-4">
          Something went wrong
        </h2>
        <p className="text-[var(--mist-600)] mb-6">
          We encountered an unexpected error. The issue has been reported automatically.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[var(--forest-600)] text-white rounded-lg hover:bg-[var(--forest-700)] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
