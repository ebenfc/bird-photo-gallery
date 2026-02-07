interface HeardBadgeProps {
  count: number;
  lastHeard?: Date | string | null;
  size?: "sm" | "md";
  showCount?: boolean;
}

export default function HeardBadge({
  count,
  lastHeard,
  size = "sm",
  showCount = true,
}: HeardBadgeProps) {
  // Format "last heard" as relative time
  const getRelativeTime = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border bg-[var(--surface-sky)] text-[var(--sky-700)] border-[var(--sky-200)] ${sizeClasses[size]}`}
      title={
        lastHeard
          ? `Last heard: ${new Date(lastHeard).toLocaleDateString()}`
          : `Heard ${count.toLocaleString()} times this year`
      }
    >
      {/* Sound wave / audio icon */}
      <svg
        className={iconSizes[size]}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
      {showCount && <span>{count.toLocaleString()}</span>}
      {lastHeard && (
        <span className="text-[var(--sky-500)]">{getRelativeTime(lastHeard)}</span>
      )}
    </span>
  );
}
