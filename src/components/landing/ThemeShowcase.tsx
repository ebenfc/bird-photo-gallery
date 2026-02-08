"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSkin } from "@/contexts/SkinContext";
import type { Skin } from "@/contexts/SkinContext";

const themes: Array<{
  value: Skin;
  label: string;
  description: string;
  colors: string[];
}> = [
  {
    value: "default",
    label: "Modern",
    description: "Clean & nature-inspired",
    colors: ["#10b981", "#14b8a6", "#064e3b", "#fafafa"],
  },
  {
    value: "bold",
    label: "Bold",
    description: "Vibrant & energetic",
    colors: ["#7c5cff", "#5e74ff", "#b1ff8f", "#f2f2f2"],
  },
  {
    value: "fieldguide",
    label: "Field Guide",
    description: "Classic naturalist",
    colors: ["#8B6F47", "#6B7F5C", "#F5F1E8", "#3A3A3A"],
  },
  {
    value: "retro",
    label: "Retro",
    description: "90s web nostalgia",
    colors: ["#000080", "#FFFF00", "#FF00FF", "#00FF00"],
  },
];

export default function ThemeShowcase() {
  const { skin, setSkin } = useSkin();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const markMounted = () => setMounted(true);
    markMounted();
  }, []);

  if (!mounted) {
    return (
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[var(--mist-50)] to-[var(--card-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-10 w-48 skeleton mx-auto mb-4" />
            <div className="h-6 w-80 skeleton mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 skeleton" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const isDark = theme === "dark";

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[var(--mist-50)] to-[var(--card-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Make it yours
          </h2>
          <p className="mt-4 text-lg text-[var(--mist-600)] max-w-2xl mx-auto">
            Choose a theme that fits your style. Try them now — your pick carries over when you sign up.
          </p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {themes.map((t) => {
            const isActive = skin === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setSkin(t.value)}
                className={`relative flex flex-col items-center gap-2.5 p-4 sm:p-5
                  rounded-[var(--radius-xl)] border-2 transition-all duration-[var(--timing-fast)]
                  ${isActive
                    ? "border-[var(--moss-500)] bg-[var(--surface-moss)] shadow-[var(--shadow-moss)]"
                    : "border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-sm)] cursor-pointer"
                  }`}
              >
                {/* Color swatches */}
                <div className="flex gap-1.5">
                  {t.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[var(--border)]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold block text-[var(--text-primary)]">
                    {t.label}
                  </span>
                  <span className="text-xs text-[var(--mist-500)] leading-tight">
                    {t.description}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-1.5 right-1.5">
                    <svg className="w-4 h-4 text-[var(--moss-500)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Light/Dark toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-full)]
              border border-[var(--border)] bg-[var(--card-bg)]
              hover:border-[var(--mist-300)] hover:shadow-[var(--shadow-sm)]
              transition-all duration-[var(--timing-fast)]
              text-sm text-[var(--mist-600)]`}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {isDark ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
      </div>
    </section>
  );
}
