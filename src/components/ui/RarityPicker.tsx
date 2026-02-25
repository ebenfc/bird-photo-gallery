"use client";

import { Rarity } from "@/types";

interface RarityPickerProps {
  value: Rarity | null;
  onChange: (rarity: Rarity | null) => void;
}

const rarities: Rarity[] = ["common", "uncommon", "rare"];

const activeStyles: Record<Rarity, string> = {
  common: "bg-[var(--mist-100)] border-[var(--mist-300)] text-[var(--mist-700)] shadow-sm",
  uncommon: "bg-[var(--amber-50)] border-[var(--amber-300)] text-[var(--amber-700)] shadow-sm",
  rare: "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)] shadow-sm",
};

const inactiveStyle =
  "bg-[var(--card-bg)] border-[var(--mist-200)] text-[var(--mist-500)] hover:border-[var(--mist-300)]";

export default function RarityPicker({ value, onChange }: RarityPickerProps) {
  return (
    <div className="flex gap-2">
      {rarities.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(value === r ? null : r)}
          className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            value === r ? activeStyles[r] : inactiveStyle
          }`}
        >
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </button>
      ))}
    </div>
  );
}
