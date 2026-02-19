"use client";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function getRelativeLabel(dateStr: string): string | null {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (dateStr === todayStr) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (dateStr === yesterdayStr) return "Yesterday";

  return null;
}

interface TimelineDayHeaderProps {
  date: string; // "YYYY-MM-DD"
}

export default function TimelineDayHeader({ date }: TimelineDayHeaderProps) {
  // Parse as local date (avoid timezone shift by splitting parts)
  const parts = date.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const dateObj = new Date(year, month - 1, day);
  const formatted = dateFormatter.format(dateObj);
  const relativeLabel = getRelativeLabel(date);

  return (
    <div className="flex items-center gap-3 pt-6 pb-2 first:pt-0">
      <h2 className="text-sm font-semibold text-[var(--text-label)] whitespace-nowrap">
        {formatted}
      </h2>
      {relativeLabel && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full
          bg-[var(--moss-100)] text-[var(--moss-700)]">
          {relativeLabel}
        </span>
      )}
      <div className="flex-1 h-px bg-[var(--mist-200)]" />
    </div>
  );
}
