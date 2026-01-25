"use client";

import { SpeciesActivityData } from "@/types";
import RarityBadge from "@/components/ui/RarityBadge";
import { useRouter } from "next/navigation";

interface SpeciesLookup {
  id: number;
  commonName: string;
}

interface SpeciesActivityRowProps {
  data: SpeciesActivityData;
  speciesLookup: SpeciesLookup[];
  onUnassignedClick?: (data: SpeciesActivityData) => void;
}

export default function SpeciesActivityRow({
  data,
  speciesLookup,
  onUnassignedClick,
}: SpeciesActivityRowProps) {
  const router = useRouter();
  const isUnassigned = data.rarity === null;

  const handleClick = () => {
    // If unassigned and callback provided, open modal to create species
    if (isUnassigned && onUnassignedClick) {
      onUnassignedClick(data);
      return;
    }

    // Find species by matching common name (case-insensitive)
    const foundSpecies = speciesLookup.find(
      (s) => s.commonName.toLowerCase() === data.commonName.toLowerCase()
    );

    if (foundSpecies) {
      // Navigate to individual species page by ID
      router.push(`/species/${foundSpecies.id}`);
    } else if (data.speciesId) {
      // Fallback: use speciesId from data if available
      router.push(`/species/${data.speciesId}`);
    } else {
      // Final fallback: navigate to species search
      router.push(`/species?search=${encodeURIComponent(data.commonName)}`);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={
        isUnassigned
          ? `Assign ${data.commonName} to a rarity category`
          : `View ${data.commonName} species details`
      }
      className={`
        w-full text-left px-4 py-3.5
        rounded-[var(--radius-md)]
        border border-transparent
        transition-all duration-[var(--timing-fast)]
        hover:shadow-[var(--shadow-md)]
        hover:border-[var(--mist-200)]
        active:scale-[0.99]
        ${
          data.hasPhoto
            ? "bg-gradient-to-br from-[var(--moss-50)] to-[var(--moss-100)/50] hover:from-[var(--moss-100)] hover:to-[var(--moss-100)]"
            : "bg-gradient-to-br from-[var(--sky-50)] to-[var(--sky-100)/50] hover:from-[var(--sky-100)] hover:to-[var(--sky-100)]"
        }
      `}
    >
      {/* Desktop Layout - Single Row */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Photo Status Icon */}
        <div className="flex-shrink-0">
          {data.hasPhoto ? (
            <svg
              className="w-5 h-5 text-[var(--moss-600)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-[var(--sky-600)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
        </div>

        {/* Species Name */}
        <div className="flex-1 min-w-0">
          <span className="text-base font-semibold text-[var(--forest-800)] truncate block">
            {data.commonName}
          </span>
        </div>

        {/* Rarity Badge */}
        <div className="flex-shrink-0">
          <RarityBadge rarity={data.rarity} size="sm" />
        </div>

        {/* Detection Count */}
        <div className="flex-shrink-0 text-right min-w-[80px]">
          <span className="text-sm font-semibold text-[var(--forest-700)]">
            {formatCount(data.yearlyCount)}
          </span>
          <span className="text-xs text-[var(--mist-600)] ml-1">heard</span>
        </div>
      </div>

      {/* Mobile Layout - Stacked */}
      <div className="flex sm:hidden flex-col gap-3">
        <div className="flex items-center gap-2.5">
          {/* Photo Status Icon */}
          {data.hasPhoto ? (
            <svg
              className="w-4 h-4 text-[var(--moss-600)] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-[var(--sky-600)] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}

          {/* Species Name */}
          <span className="text-base font-semibold text-[var(--forest-800)] flex-1 truncate">
            {data.commonName}
          </span>
        </div>

        {/* Second row: Rarity and Count */}
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <RarityBadge rarity={data.rarity} size="sm" />
          <div className="flex items-center gap-1">
            <span className="text-[var(--forest-700)] font-semibold">
              {formatCount(data.yearlyCount)}
            </span>
            <span className="text-[var(--mist-600)]">heard</span>
          </div>
        </div>
      </div>
    </button>
  );
}
