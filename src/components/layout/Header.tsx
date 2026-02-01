"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

// Bird icon - Dark Eyed Junco silhouette
function BirdIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gray head */}
      <path
        fill="#5B6770"
        d="M 32,6 C 36,6 40,7 42,9 C 45,11 47,14 47,18 C 47,20 46,22 44,24 C 42,25 40,26 37,26 C 35,26 33,25 31,24 C 29,23 27,21 26,19 C 25,17 24,16 22,15 C 23,14 25,13 27,11 C 29,9 30,7 32,6 Z"
      />

      {/* Brown wing/back */}
      <path
        fill="#8B6F47"
        d="M 22,15 C 18,16 14,18 11,21 C 8,24 6,27 6,30 C 6,32 7,34 9,35 C 11,36 14,36 17,35 C 20,34 23,32 25,30 C 27,28 29,26 31,24 C 33,25 35,26 37,26 C 40,26 42,25 44,24 C 46,22 47,20 47,18 C 47,16 46,14 44,12 C 42,10 39,9 36,8 C 33,7 30,7 27,8 L 22,15 Z"
      />

      {/* Tail */}
      <path
        fill="#8B6F47"
        d="M 11,21 C 8,22 5,24 3,26 C 2,27 1,29 2,31 C 3,33 5,34 7,33 C 9,32 10,30 11,28 C 11,26 11,24 11,21 Z"
      />

      {/* Orange breast */}
      <path
        fill="#FF6B4A"
        d="M 17,35 C 14,36 11,36 9,35 C 7,34 6,32 6,30 C 6,28 7,26 8,24 C 10,22 12,20 15,19 C 17,18 19,18 21,19 C 23,20 24,22 24,24 C 24,27 23,30 21,32 C 20,33 18,34 17,35 Z"
      />

      {/* White accent trim */}
      <path
        fill="#FFFFFF"
        d="M 21,19 C 23,18 25,18 27,19 C 29,20 30,21 30,23 C 30,25 29,26 27,27 C 25,28 23,28 21,27 C 19,26 18,24 18,22 C 18,21 19,20 21,19 Z"
        opacity="0.95"
      />

      {/* Eye */}
      <circle cx="38" cy="16" r="2" fill="#1A202C" />
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
      label: "Feed",
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

          {/* User Menu and Mobile Menu Button */}
          <div className="flex items-center gap-2">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-9 sm:h-9",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden sm:flex px-4 py-2 rounded-[var(--radius-lg)] text-sm font-semibold
                  text-[var(--moss-200)] hover:text-white hover:bg-white/10
                  transition-all duration-[var(--timing-fast)]"
              >
                Sign in
              </Link>
            </SignedOut>

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
            {/* Sign in link for mobile (shown when signed out) */}
            <SignedOut>
              <Link
                href="/sign-in"
                className="flex items-center gap-3 px-4 py-3.5
                  rounded-[var(--radius-lg)] text-base font-semibold
                  text-[var(--moss-200)] hover:text-white hover:bg-white/10
                  transition-all duration-[var(--timing-fast)]
                  active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign in</span>
              </Link>
            </SignedOut>
          </nav>
        </div>
      )}

      {/* Accent bar at bottom */}
      <div className="h-1 bg-gradient-to-r from-[var(--moss-500)] via-[var(--forest-600)] to-[var(--moss-500)]" />
    </header>
  );
}
