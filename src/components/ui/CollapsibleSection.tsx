"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[var(--mist-100)] overflow-hidden ${className}`}>
      {/* Header - clickable to toggle */}
      <button
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        className="w-full px-6 py-4 bg-gradient-to-r from-[var(--forest-50)] to-[var(--moss-50)]
          hover:from-[var(--forest-100)] hover:to-[var(--moss-100)]
          border-b border-[var(--mist-100)] transition-all duration-200
          flex items-center justify-between cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[var(--moss-400)] focus:ring-offset-2"
        aria-expanded={isExpanded}
        aria-controls="collapsible-content"
      >
        <h3 className="font-semibold text-[var(--forest-900)] text-left">
          {title}
        </h3>

        {/* Chevron icon */}
        <svg
          className={`w-5 h-5 text-[var(--forest-700)] transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - with smooth transition */}
      <div
        id="collapsible-content"
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
