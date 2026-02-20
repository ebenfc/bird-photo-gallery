"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type {
  TimelineEvent,
  TimelineResponse,
  TimelineMonthSummary,
  TimelineMonthsResponse,
} from "@/types";
import TimelineDayHeader from "@/components/timeline/TimelineDayHeader";
import TimelineEventCard from "@/components/timeline/TimelineEventCard";
import TimelineMonthNav from "@/components/timeline/TimelineMonthNav";

/** Group events by calendar day (local time), returning entries in insertion order (desc). */
function groupByDay(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const d = new Date(event.eventDate);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(dayKey, [event]);
    }
  }
  return groups;
}

/** Unique key for React list rendering */
function getEventKey(event: TimelineEvent): string {
  switch (event.type) {
    case "photo":
      return `photo-${event.id}`;
    case "ebird_lifer":
      return `ebird-${event.id}`;
    case "haikubox":
      return `haikubox-${event.speciesCommonName}-${event.eventDate}`;
  }
}

/** Derive "YYYY-MM" from the first event's date (for active month tracking). */
function deriveMonth(events: TimelineEvent[]): string | null {
  const first = events[0];
  if (!first) return null;
  const d = new Date(first.eventDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Get the number of days in a given "YYYY-MM" month. */
function daysInMonth(monthStr: string): number {
  const [year, month] = monthStr.split("-").map(Number);
  // Day 0 of the next month = last day of this month
  return new Date(year!, month!, 0).getDate();
}

/** Get an ISO string for the start of the next month (used as "before" cursor). */
function nextMonthStart(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year!, month!, 1).toISOString();
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Month navigator state
  const [months, setMonths] = useState<TimelineMonthSummary[]>([]);
  const [monthsLoading, setMonthsLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Track latest cursor in a ref so the IntersectionObserver callback sees the current value
  const nextCursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  nextCursorRef.current = nextCursor;
  loadingMoreRef.current = loadingMore;

  const fetchTimeline = useCallback(async (cursor?: string, options?: { days?: number; replace?: boolean }) => {
    const isReplace = options?.replace ?? !cursor;
    if (isReplace) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const days = options?.days ?? 30;
      const params = new URLSearchParams({ days: String(days) });
      if (cursor) params.set("before", cursor);

      const res = await fetch(`/api/timeline?${params}`);
      if (!res.ok) throw new Error("Failed to fetch timeline");

      const data: TimelineResponse = await res.json();

      if (isReplace) {
        setEvents(data.events);
      } else {
        setEvents((prev) => [...prev, ...data.events]);
      }
      setNextCursor(data.nextCursor);
      setHasLoadedOnce(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch months summary and initial timeline events in parallel on mount
  useEffect(() => {
    async function fetchMonths() {
      try {
        const res = await fetch("/api/timeline/months");
        if (!res.ok) return;
        const data: TimelineMonthsResponse = await res.json();
        setMonths(data.months);
      } catch {
        // Non-critical — month nav just won't show
      } finally {
        setMonthsLoading(false);
      }
    }

    fetchMonths();
    fetchTimeline();
  }, [fetchTimeline]);

  // Update active month when events change
  useEffect(() => {
    if (events.length > 0 && !activeMonth) {
      setActiveMonth(deriveMonth(events));
    }
  }, [events, activeMonth]);

  // Infinite scroll: observe sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && nextCursorRef.current && !loadingMoreRef.current) {
          fetchTimeline(nextCursorRef.current);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchTimeline, hasLoadedOnce]);

  // Handle month selection from nav
  const handleSelectMonth = useCallback((monthStr: string) => {
    setActiveMonth(monthStr);
    const before = nextMonthStart(monthStr);
    const days = daysInMonth(monthStr);
    setEvents([]);
    fetchTimeline(before, { days, replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchTimeline]);

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="pnw-texture min-h-screen">
        <div className="hidden sm:block mb-8">
          <div className="h-9 w-40 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse mb-2" />
          <div className="h-5 w-72 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse" />
        </div>
        <div className="sm:hidden mb-4">
          <div className="h-7 w-28 bg-[var(--mist-100)] rounded-[var(--radius-md)] animate-pulse" />
        </div>
        <div className="max-w-3xl mx-auto">
          <TimelineMonthNav
            months={months}
            activeMonth={activeMonth}
            onSelectMonth={handleSelectMonth}
            loading={monthsLoading}
          />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[88px] bg-[var(--mist-100)] rounded-[var(--radius-lg)] animate-pulse mb-3"
            />
          ))}
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="pnw-texture min-h-screen">
        <div className="hidden sm:block mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Timeline
          </h1>
        </div>
        <div className="sm:hidden mb-4">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Timeline</h1>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="bg-[var(--error-bg)] border border-[var(--error-border)]
            rounded-[var(--radius-lg)] p-6 text-center">
            <p className="text-[var(--error-text)] font-medium">{error}</p>
            <button
              onClick={() => fetchTimeline()}
              className="mt-4 px-4 py-2 rounded-[var(--radius-md)]
                bg-[var(--forest-600)] text-white text-sm font-semibold
                hover:bg-[var(--forest-700)] transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (hasLoadedOnce && events.length === 0) {
    return (
      <div className="pnw-texture min-h-screen">
        <div className="hidden sm:block mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Timeline
          </h1>
          <p className="text-[var(--mist-600)]">
            Your birding story, day by day.
          </p>
        </div>
        <div className="sm:hidden mb-4">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Timeline</h1>
        </div>
        <div className="max-w-3xl mx-auto">
          {months.length > 0 && (
            <TimelineMonthNav
              months={months}
              activeMonth={activeMonth}
              onSelectMonth={handleSelectMonth}
              loading={false}
            />
          )}
          <div className="bg-[var(--card-bg)] border border-[var(--border-light)]
            rounded-[var(--radius-lg)] p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-[var(--mist-300)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {months.length > 0 ? "No events this month" : "Your timeline is waiting"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              {months.length > 0
                ? "Try selecting a different month above."
                : "As you build your birding life, events will appear here in chronological order. Here\u2019s how to get started:"}
            </p>
            {months.length === 0 && (
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-md)]
                    bg-[var(--mist-50)] hover:bg-[var(--mist-100)] transition-colors"
                >
                  <span className="text-lg">📷</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">Upload photos</span>
                    {" "}&mdash; they&apos;ll appear on your timeline by date taken
                  </span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-md)]
                    bg-[var(--mist-50)] hover:bg-[var(--mist-100)] transition-colors"
                >
                  <span className="text-lg">📋</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">Import your eBird life list</span>
                    {" "}&mdash; see when you first observed each species
                  </span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-md)]
                    bg-[var(--mist-50)] hover:bg-[var(--mist-100)] transition-colors"
                >
                  <span className="text-lg">🎵</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-primary)]">Connect a Haikubox</span>
                    {" "}&mdash; detections show up automatically
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Timeline content ---
  const grouped = groupByDay(events);

  return (
    <div className="pnw-texture min-h-screen">
      {/* Desktop header */}
      <div className="hidden sm:block mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
          Timeline
        </h1>
        <p className="text-[var(--mist-600)]">
          Your birding story, day by day.
        </p>
      </div>

      {/* Mobile header */}
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Timeline</h1>
      </div>

      {/* Event list grouped by day */}
      <div className="max-w-3xl mx-auto">
        {/* Month navigator */}
        <TimelineMonthNav
          months={months}
          activeMonth={activeMonth}
          onSelectMonth={handleSelectMonth}
          loading={monthsLoading}
        />

        {Array.from(grouped.entries()).map(([dayKey, dayEvents]) => (
          <div key={dayKey}>
            <TimelineDayHeader date={dayKey} />
            <div className="space-y-3 pb-2">
              {dayEvents.map((event) => (
                <TimelineEventCard key={getEventKey(event)} event={event} />
              ))}
            </div>
          </div>
        ))}

        {/* Infinite scroll sentinel + loading indicator */}
        <div ref={sentinelRef} className="py-8 text-center">
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 text-[var(--text-tertiary)]">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Loading more...</span>
            </div>
          )}
          {!nextCursor && hasLoadedOnce && events.length > 0 && !loadingMore && (
            <p className="text-sm text-[var(--text-tertiary)]">
              You&apos;ve reached the beginning of your timeline.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
