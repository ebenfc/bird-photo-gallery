"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Evergreen tree icon component
function EvergreenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L6 9h2l-3 5h2l-4 7h18l-4-7h2l-3-5h2L12 2z" />
      <rect x="10" y="21" width="4" height="2" rx="0.5" />
    </svg>
  );
}

// Bird silhouette icon
function BirdIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21.5 8.5c-.5-.5-1.5-.5-2.5 0L15 12l-3-1-4.5 2.5c-1.5 1-2 2.5-1.5 4l1 2.5 1.5-1 2-1.5 3 .5 2-1.5 4-4c1-1 1-2.5 0-3.5l-2.5-2z" />
      <circle cx="18" cy="7" r="1" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [unassignedCount, setUnassignedCount] = useState(0);

  useEffect(() => {
    const fetchUnassignedCount = async () => {
      try {
        const res = await fetch("/api/photos/unassigned");
        const data = await res.json();
        setUnassignedCount(data.count);
      } catch (err) {
        console.error("Failed to fetch unassigned count:", err);
      }
    };

    fetchUnassignedCount();

    // Refresh count every 10 seconds
    const interval = setInterval(fetchUnassignedCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems: Array<{ href: string; label: string; badge?: number }> = [
    { href: "/", label: "Gallery" },
    { href: "/inbox", label: "Inbox", badge: unassignedCount },
    { href: "/species", label: "Species" },
    { href: "/favorites", label: "Favorites" },
  ];

  return (
    <header className="bg-gradient-to-r from-[var(--forest-950)] to-[var(--forest-800)] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <EvergreenIcon className="w-7 h-7 text-[var(--moss-400)] group-hover:text-[var(--moss-300)] transition-colors" />
              <BirdIcon className="w-4 h-4 text-white absolute -right-1 top-0 opacity-80" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg text-white leading-tight">
                Bird Gallery
              </span>
              <span className="text-[10px] text-[var(--moss-300)] uppercase tracking-wider hidden sm:block">
                Pacific Northwest
              </span>
            </div>
          </Link>

          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasBadge = item.badge !== undefined && item.badge > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/20 text-white shadow-inner"
                      : "text-[var(--moss-200)] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                  {hasBadge && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold rounded-full shadow-md ${
                        isActive
                          ? "bg-[var(--moss-400)] text-[var(--forest-950)]"
                          : "bg-[var(--moss-500)] text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Subtle mountain silhouette at bottom of header */}
      <div className="h-1 bg-gradient-to-r from-[var(--moss-600)] via-[var(--forest-700)] to-[var(--moss-600)]" />
    </header>
  );
}
