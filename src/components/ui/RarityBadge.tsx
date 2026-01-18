import { Rarity } from "@/types";

interface RarityBadgeProps {
  rarity: Rarity;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const rarityConfig = {
  common: {
    label: "Common",
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-200",
  },
  uncommon: {
    label: "Uncommon",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  rare: {
    label: "Rare",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

export default function RarityBadge({
  rarity,
  size = "sm",
  showLabel = true,
}: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      {showLabel && config.label}
    </span>
  );
}

// Helper to get just the label
export function getRarityLabel(rarity: Rarity): string {
  return rarityConfig[rarity].label;
}
