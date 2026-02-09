import { Rarity, DisplayRarity } from "@/types";

interface RarityBadgeProps {
  rarity: Rarity | null; // null indicates unassigned
  size?: "sm" | "md";
  showLabel?: boolean;
  showIcon?: boolean;
}

const rarityConfig: Record<
  DisplayRarity,
  {
    label: string;
    icon: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    glow?: string;
  }
> = {
  common: {
    label: "Common",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
    bgColor: "bg-[var(--mist-100)]",
    textColor: "text-[var(--mist-700)]",
    borderColor: "border-[var(--mist-200)]",
  },
  uncommon: {
    label: "Uncommon",
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    bgColor: "bg-gradient-to-br from-[var(--amber-50)] to-[var(--amber-100)]",
    textColor: "text-[var(--amber-700)]",
    borderColor: "border-[var(--amber-300)]",
  },
  rare: {
    label: "Rare",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    bgColor: "bg-[var(--error-bg)]",
    textColor: "text-[var(--error-text)]",
    borderColor: "border-[var(--error-border)]",
    glow: "shadow-[var(--error-ring-shadow)]",
  },
  unassigned: {
    label: "Unassigned",
    icon: "M12 4v16m8-8H4", // Plus sign to indicate action needed
    bgColor: "bg-[var(--mist-100)]",
    textColor: "text-[var(--mist-600)]",
    borderColor: "border-[var(--mist-300)] border-dashed",
  },
};

export default function RarityBadge({
  rarity,
  size = "sm",
  showLabel = true,
  showIcon = false,
}: RarityBadgeProps) {
  // Convert null to "unassigned" for display
  const displayRarity: DisplayRarity = rarity ?? "unassigned";
  const config = rarityConfig[displayRarity];
  const isRare = displayRarity === "rare";
  const isUnassigned = displayRarity === "unassigned";

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold
        rounded-[var(--radius-full)] border
        transition-all duration-[var(--timing-fast)]
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${isRare ? "shadow-[var(--error-ring-shadow)] hover:shadow-[var(--error-ring-shadow)]" : ""}
        ${displayRarity === "uncommon" ? "shadow-[var(--shadow-amber)]" : ""}
      `}
    >
      {(showIcon || isUnassigned) && (
        <svg
          className={`${iconSizes[size]} flex-shrink-0`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={displayRarity === "common" || isUnassigned ? 2 : 1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={config.icon}
            fill={displayRarity !== "common" && !isUnassigned ? "currentColor" : "none"}
          />
        </svg>
      )}
      {showLabel && config.label}
    </span>
  );
}

// Helper to get just the label
export function getRarityLabel(rarity: Rarity | null): string {
  const displayRarity: DisplayRarity = rarity ?? "unassigned";
  return rarityConfig[displayRarity].label;
}
