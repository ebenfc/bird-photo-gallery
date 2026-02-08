"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSkin } from "@/contexts/SkinContext";

const modeOptions = [
  {
    value: "light" as const,
    label: "Light",
    description: "Always light",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: "dark" as const,
    label: "Dark",
    description: "Always dark",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    value: "system" as const,
    label: "System",
    description: "Matches your device",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const skinOptions = [
  {
    value: "default" as const,
    label: "Default",
    description: "Nature-inspired PNW design",
    colors: ["#10b981", "#14b8a6", "#064e3b", "#fafafa"],
    available: true,
  },
  {
    value: "bold" as const,
    label: "Bold",
    description: "Vibrant and colorful",
    colors: ["#7c5cff", "#5e74ff", "#b1ff8f", "#f2f2f2"],
    available: true,
  },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { skin, setSkin, retroUnlocked } = useSkin();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — useTheme() returns undefined during SSR
  useEffect(() => {
    const markMounted = () => setMounted(true);
    markMounted();
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-8">
        {/* Skeleton for mode selector */}
        <div>
          <div className="h-5 w-24 skeleton mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 skeleton" />
            ))}
          </div>
        </div>
        {/* Skeleton for skin selector */}
        <div>
          <div className="h-5 w-16 skeleton mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mode Selector */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-label)] mb-3">Mode</h3>
        <div className="grid grid-cols-3 gap-3">
          {modeOptions.map((option) => {
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`relative flex flex-col items-center gap-2 p-4
                  rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--timing-fast)]
                  ${isActive
                    ? "border-[var(--moss-500)] bg-[var(--surface-moss)] shadow-[var(--shadow-moss)]"
                    : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-sm)]"
                  }`}
              >
                <span className={`${isActive ? "text-[var(--moss-600)]" : "text-[var(--mist-500)]"}`}>
                  {option.icon}
                </span>
                <span className={`text-sm font-semibold ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"}`}>
                  {option.label}
                </span>
                <span className="text-xs text-[var(--mist-500)] leading-tight text-center">
                  {option.description}
                </span>
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-[var(--moss-500)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skin Selector */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-label)] mb-3">Style</h3>
        <div className="grid grid-cols-2 gap-3">
          {skinOptions.map((option) => {
            const isActive = skin === option.value;
            const isDisabled = !option.available;
            return (
              <button
                key={option.value}
                onClick={() => {
                  if (option.available) setSkin(option.value);
                }}
                disabled={isDisabled}
                className={`relative flex flex-col items-start gap-2 p-4
                  rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--timing-fast)]
                  ${isDisabled
                    ? "border-[var(--border-light)] bg-[var(--card-bg)] opacity-60 cursor-not-allowed"
                    : isActive
                      ? "border-[var(--moss-500)] bg-[var(--surface-moss)] shadow-[var(--shadow-moss)]"
                      : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-sm)] cursor-pointer"
                  }`}
              >
                {/* Color swatches */}
                <div className="flex gap-1.5">
                  {option.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div>
                  <span className={`text-sm font-semibold block ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-[var(--mist-500)] leading-tight">
                    {isDisabled ? "Coming soon" : option.description}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-[var(--moss-500)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}

          {/* Retro easter egg card — only visible when unlocked */}
          {retroUnlocked && (
            <button
              onClick={() => setSkin("retro")}
              className={`relative flex flex-col items-start gap-2 p-4 col-span-2
                rounded-[var(--radius-lg)] border-2 transition-all duration-[var(--timing-fast)]
                ${skin === "retro"
                  ? "border-[var(--moss-500)] bg-[var(--surface-moss)] shadow-[var(--shadow-moss)]"
                  : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-sm)] cursor-pointer"
                }`}
            >
              {/* Retro color swatches */}
              <div className="flex gap-1.5">
                {["#000080", "#FFFF00", "#FF00FF", "#00FF00"].map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-[var(--border)]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div>
                <span className="text-sm font-semibold block text-[var(--text-primary)]">
                  Retro
                  <span className="ml-2 text-[10px] font-normal text-[var(--mist-500)]">circa 1997</span>
                </span>
                <span className="text-xs text-[var(--mist-500)] leading-tight">90s web nostalgia</span>
              </div>
              {skin === "retro" && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-[var(--moss-500)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
