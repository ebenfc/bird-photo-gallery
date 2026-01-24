"use client";

import { SpeciesActivityData } from "@/types";
import RarityBadge from "@/components/ui/RarityBadge";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface SpeciesActivityRowProps {
  data: SpeciesActivityData;
}

export default function SpeciesActivityRow({ data }: SpeciesActivityRowProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to species search
    router.push(`/species?search=${encodeURIComponent(data.commonName)}`);
  };

  const formatLastHeard = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
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
      className={`
        w-full text-left px-4 py-3
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
          <RarityBadge rarity={data.rarity || "common"} size="sm" />
        </div>

        {/* Detection Count */}
        <div className="flex-shrink-0 text-right min-w-[80px]">
          <span className="text-sm font-semibold text-[var(--forest-700)]">
            {formatCount(data.yearlyCount)}
          </span>
          <span className="text-xs text-[var(--mist-600)] ml-1">heard</span>
        </div>

        {/* Last Heard */}
        <div className="flex-shrink-0 text-right min-w-[100px]">
          <span className="text-sm text-[var(--mist-600)]">
            {formatLastHeard(data.lastHeardAt)}
          </span>
        </div>
      </div>

      {/* Mobile Layout - Stacked */}
      <div className="flex sm:hidden flex-col gap-2">
        <div className="flex items-center gap-2">
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

        {/* Second row: Rarity, Count, Last Heard */}
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <RarityBadge rarity={data.rarity || "common"} size="sm" />
          <span className="text-[var(--forest-700)] font-semibold">
            {formatCount(data.yearlyCount)} heard
          </span>
          <span className="text-[var(--mist-600)]">·</span>
          <span className="text-[var(--mist-600)]">
            {formatLastHeard(data.lastHeardAt)}
          </span>
        </div>
      </div>
    </button>
  );
}
