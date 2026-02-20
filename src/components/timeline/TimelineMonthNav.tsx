"use client";

import { useRef, useEffect } from "react";
import type { TimelineMonthSummary } from "@/types";

const monthLabels = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonthLabel(monthStr: string): string {
  const [year, monthNum] = monthStr.split("-");
  const idx = parseInt(monthNum ?? "1", 10) - 1;
  return `${monthLabels[idx]} ${year}`;
}

interface TimelineMonthNavProps {
  months: TimelineMonthSummary[];
  activeMonth: string | null;
  onSelectMonth: (month: string) => void;
  loading: boolean;
}

export default function TimelineMonthNav({
  months,
  activeMonth,
  onSelectMonth,
  loading,
}: TimelineMonthNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active pill into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeMonth]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="sticky top-0 z-30 bg-[var(--page-bg)] border-b border-[var(--border-light)] mb-4">
        <div className="flex gap-2 py-3 px-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-[var(--mist-100)] rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (months.length === 0) return null;

  return (
    <div className="sticky top-0 z-30 bg-[var(--page-bg)] border-b border-[var(--border-light)] mb-4">
      <div
        ref={scrollRef}
        className="flex gap-2 py-3 px-1 overflow-x-auto
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          scroll-smooth snap-x snap-mandatory"
      >
        {months.map((m) => {
          const isActive = m.month === activeMonth;
          return (
            <button
              key={m.month}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelectMonth(m.month)}
              className={`flex-shrink-0 snap-start rounded-full font-semibold
                transition-all duration-[var(--timing-fast)]
                text-xs px-2.5 py-1 sm:text-sm sm:px-3 sm:py-1.5
                ${isActive
                  ? "bg-[var(--forest-600)] text-white shadow-[var(--shadow-sm)]"
                  : "bg-[var(--mist-100)] text-[var(--mist-600)] hover:bg-[var(--mist-200)] hover:text-[var(--text-primary)]"
                }`}
            >
              {formatMonthLabel(m.month)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
