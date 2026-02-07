"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ReportIssueModal from "./ReportIssueModal";

/**
 * Floating action button that opens the "Report Issue" modal.
 * Sits in the bottom-right corner, visible on all authenticated pages.
 */
export default function ReportIssueButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Capture the full URL when the user clicks the button (not when they submit)
  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Report an issue"
        title="Report an issue"
        className="hidden sm:fixed sm:bottom-6 sm:right-6 z-40
          w-11 h-11 rounded-full
          bg-[var(--forest-700)] text-white
          shadow-lg hover:shadow-xl
          hover:bg-[var(--forest-600)]
          active:scale-95
          transition-all duration-200
          sm:flex items-center justify-center"
      >
        {/* Flag icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 21v-18M3 3h12.5l-2 4 2 4H3"
          />
        </svg>
      </button>

      <ReportIssueModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pageUrl={typeof window !== "undefined" ? window.location.href : pathname}
      />
    </>
  );
}
