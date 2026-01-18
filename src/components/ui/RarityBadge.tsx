import { Rarity } from "@/types";

interface RarityBadgeProps {
  rarity: Rarity;
  size?: "sm" | "md";
  showLabel?: boolean;
  showIcon?: boolean;
}

const rarityConfig = {
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
    bgColor: "bg-gradient-to-br from-red-50 to-rose-100",
    textColor: "text-red-700",
    borderColor: "border-red-300",
    glow: "shadow-[0_2px_8px_rgba(239,68,68,0.15)]",
  },
};

export default function RarityBadge({
  rarity,
  size = "sm",
  showLabel = true,
  showIcon = false,
}: RarityBadgeProps) {
  const config = rarityConfig[rarity];
  const isRare = rarity === "rare";

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
        ${isRare ? "shadow-[0_2px_8px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)]" : ""}
        ${rarity === "uncommon" ? "shadow-[0_2px_6px_rgba(245,158,11,0.15)]" : ""}
      `}
    >
      {showIcon && (
        <svg
          className={`${iconSizes[size]} flex-shrink-0`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={rarity === "common" ? 2 : 1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={config.icon}
            fill={rarity !== "common" ? "currentColor" : "none"}
          />
        </svg>
      )}
      {showLabel && config.label}
    </span>
  );
}

// Helper to get just the label
export function getRarityLabel(rarity: Rarity): string {
  return rarityConfig[rarity].label;
}
