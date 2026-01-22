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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnassignedCount = async () => {
      try {
        const res = await fetch("/api/photos/unassigned");
        if (!res.ok) {
          console.error("Failed to fetch unassigned count: API returned", res.status);
          return;
        }
        const data = await res.json();
        setUnassignedCount(data.count ?? 0);
      } catch (err) {
        console.error("Failed to fetch unassigned count:", err);
      }
    };

    fetchUnassignedCount();

    // Refresh count every 10 seconds
    const interval = setInterval(fetchUnassignedCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems: Array<{ href: string; label: string; badge?: number; icon: React.ReactNode }> = [
    {
      href: "/",
      label: "Gallery",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      href: "/inbox",
      label: "Inbox",
      badge: unassignedCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
    {
      href: "/species",
      label: "Species",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: "/favorites",
      label: "Favorites",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="bg-gradient-to-r from-[var(--forest-950)] to-[var(--forest-800)]
      sticky top-0 z-50 shadow-[var(--shadow-lg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - with proper touch target for mobile */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group -ml-2 pl-2 pr-3 py-2
              active:opacity-80 transition-opacity"
          >
            <div className="relative transition-transform duration-[var(--timing-fast)] group-hover:scale-105">
              <EvergreenIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--moss-400)]
                group-hover:text-[var(--moss-300)] transition-colors duration-[var(--timing-fast)]" />
              <BirdIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white
                absolute -right-0.5 -top-0.5 sm:-right-1 sm:top-0 opacity-90" />
            </div>
            <span className="font-bold text-base sm:text-lg text-white tracking-tight">
              Bird Gallery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasBadge = item.badge !== undefined && item.badge > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-semibold
                    transition-all duration-[var(--timing-fast)]
                    ${isActive
                      ? "bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "text-[var(--moss-200)] hover:text-white hover:bg-white/10"
                    }`}
                >
                  {item.label}
                  {hasBadge && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px]
                        flex items-center justify-center px-1.5
                        text-xs font-bold rounded-full
                        shadow-[var(--shadow-md)]
                        transition-all duration-[var(--timing-fast)]
                        ${isActive
                          ? "bg-[var(--moss-300)] text-[var(--forest-950)]"
                          : "bg-gradient-to-b from-[var(--moss-400)] to-[var(--moss-500)] text-white"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2.5 -mr-2 text-white/80 hover:text-white
              hover:bg-white/10 rounded-[var(--radius-md)]
              transition-all duration-[var(--timing-fast)]
              active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/10 animate-fade-in">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasBadge = item.badge !== undefined && item.badge > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5
                    rounded-[var(--radius-lg)] text-base font-semibold
                    transition-all duration-[var(--timing-fast)]
                    active:scale-[0.98]
                    ${isActive
                      ? "bg-white/20 text-white"
                      : "text-[var(--moss-200)] hover:text-white hover:bg-white/10"
                    }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {hasBadge && (
                    <span className="min-w-[26px] h-[26px] flex items-center justify-center px-2
                      text-sm font-bold rounded-full
                      bg-gradient-to-b from-[var(--moss-400)] to-[var(--moss-500)] text-white
                      shadow-[var(--shadow-sm)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Accent bar at bottom */}
      <div className="h-1 bg-gradient-to-r from-[var(--moss-500)] via-[var(--forest-600)] to-[var(--moss-500)]" />
    </header>
  );
}
