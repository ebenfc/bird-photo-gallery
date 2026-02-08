"use client";

import { US_STATES } from "@/config/usStates";

interface DiscoverFiltersProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  sort: "alpha" | "random";
  onSortChange: (sort: "alpha" | "random") => void;
}

export default function DiscoverFilters({
  selectedState,
  onStateChange,
  sort,
  onSortChange,
}: DiscoverFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* State Filter */}
      <div className="flex-1">
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-[var(--border-light)] rounded-[var(--radius-md)]
            text-[var(--text-primary)] bg-[var(--card-bg)] text-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--moss-500)] focus:border-transparent
            transition-all duration-[var(--timing-fast)]"
        >
          <option value="">All States</option>
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Toggle */}
      <div className="flex rounded-[var(--radius-md)] border border-[var(--border-light)] overflow-hidden">
        <button
          onClick={() => onSortChange("alpha")}
          aria-pressed={sort === "alpha"}
          className={`px-4 py-2.5 text-sm font-medium transition-all duration-[var(--timing-fast)]
            ${
              sort === "alpha"
                ? "bg-[var(--moss-100)] text-[var(--moss-700)]"
                : "bg-[var(--card-bg)] text-[var(--mist-500)] hover:text-[var(--forest-700)] hover:bg-[var(--mist-50)]"
            }`}
        >
          A-Z
        </button>
        <button
          onClick={() => onSortChange("random")}
          aria-pressed={sort === "random"}
          className={`px-4 py-2.5 text-sm font-medium border-l border-[var(--border-light)]
            transition-all duration-[var(--timing-fast)]
            ${
              sort === "random"
                ? "bg-[var(--moss-100)] text-[var(--moss-700)]"
                : "bg-[var(--card-bg)] text-[var(--mist-500)] hover:text-[var(--forest-700)] hover:bg-[var(--mist-50)]"
            }`}
        >
          Random
        </button>
      </div>
    </div>
  );
}
