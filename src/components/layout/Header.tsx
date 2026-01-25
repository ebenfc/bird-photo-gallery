"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Bird icon - Dark Eyed Junco inspired design
function BirdIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brown back and wing */}
      <path
        fill="#8B6F47"
        d="M9 7.5c1.5-.5 3-.5 4.5 0 1.8.6 3.5 1.5 5 3 .5.5.8 1 1 1.5.2.5.3 1 .2 1.5-.1.8-.5 1.5-1.2 2-.5.4-1.2.6-1.8.5-1-.2-1.8-.8-2.2-1.7-.3-.7-.8-1.3-1.5-1.8-.7-.5-1.5-.7-2.3-.6-1 .1-1.8.6-2.3 1.5-.3.5-.7.9-1.2 1.2-.5.3-1.1.4-1.7.3-.8-.2-1.4-.7-1.7-1.5-.2-.5-.2-1 0-1.5.3-.7.8-1.3 1.5-1.8.9-.7 2-1.2 3.2-1.6z"
      />
      {/* Gray head */}
      <path
        fill="#5B6770"
        d="M14.5 4c1 0 1.9.4 2.6 1 .7.7 1.1 1.6 1.1 2.6 0 .8-.3 1.6-.8 2.2-.5.6-1.2 1.1-2 1.3-.5.1-1 .1-1.5 0-.8-.2-1.5-.7-2-1.3-.5-.6-.8-1.4-.8-2.2 0-1 .4-1.9 1.1-2.6.7-.6 1.6-1 2.6-1h-.3z"
      />
      {/* Orange breast */}
      <path
        fill="#FF6B4A"
        d="M6 12.5c.3-.8.9-1.5 1.7-1.8.5-.2 1-.2 1.5 0 .7.3 1.3.8 1.6 1.5.3.6.4 1.3.3 2-.1.8-.5 1.5-1.1 2-.6.5-1.4.8-2.2.7-1-.1-1.8-.6-2.3-1.4-.4-.7-.5-1.5-.3-2.3.1-.3.3-.5.5-.7h.3z"
      />
      {/* White accent trim */}
      <path
        fill="#FFFFFF"
        d="M10.5 10c.5.2.9.5 1.2.9.3.4.5.9.4 1.4-.1.6-.4 1-.9 1.3-.4.2-.9.3-1.3.1-.5-.2-.9-.5-1.1-1-.2-.4-.2-.9 0-1.3.2-.5.6-.9 1.1-1.1.2-.2.4-.3.6-.3z"
      />
      {/* Eye */}
      <circle cx="15.5" cy="6.5" r="0.8" fill="#2D3748" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate use: close menu on navigation
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [
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
      href: "/species",
      label: "Species",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      href: "/activity",
      label: "Activity",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ),
    },
    {
      href: "/resources",
      label: "Resources",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
            <div className="transition-transform duration-[var(--timing-fast)] group-hover:scale-105">
              <BirdIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white
                group-hover:text-[var(--moss-300)] transition-colors duration-[var(--timing-fast)]" />
            </div>
            <span className="font-bold text-base sm:text-lg text-white tracking-tight">
              Bird Feed
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-semibold
                    transition-all duration-[var(--timing-fast)]
                    ${isActive
                      ? "bg-white/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "text-[var(--moss-200)] hover:text-white hover:bg-white/10"
                    }`}
                >
                  {item.label}
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
                  <span>{item.label}</span>
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
