"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import ReportIssueModal from "@/components/support/ReportIssueModal";
import { useSkin } from "@/contexts/SkinContext";
import { useToast } from "@/components/ui/Toast";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { useLogoTapUnlock } from "@/hooks/useLogoTapUnlock";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const { retroUnlocked, unlockRetro } = useSkin();
  const { showToast } = useToast();

  // Easter egg unlock handler — shared by Konami Code + logo taps
  const handleRetroUnlock = useCallback(() => {
    if (retroUnlocked) return;
    unlockRetro();
    showToast("You unlocked the Retro skin! Check Settings \u2192 Appearance.", "success");
  }, [retroUnlocked, unlockRetro, showToast]);

  useKonamiCode(handleRetroUnlock);
  const handleLogoTap = useLogoTapUnlock(handleRetroUnlock);

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
      href: "/discover",
      label: "Discover",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      href: "/about",
      label: "About",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            onClick={handleLogoTap}
            className="flex items-center gap-2 -ml-2 pl-2 pr-3 py-2
              active:opacity-80 transition-opacity"
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* Bird silhouette */}
              <ellipse cx="11" cy="14" rx="6.5" ry="4.5" />
              <circle cx="17" cy="8" r="3" />
              <path d="M5 12C7 8.5 11 7 14.5 8L12.5 10C10 11 7.5 12 5 12Z" />
              <path d="M5.5 12L2 10.5L3 14Z" />
              <path d="M19.5 7L22.5 8L19.5 9.5Z" />
            </svg>
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
                  aria-current={isActive ? "page" : undefined}
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
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
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
        <div id="mobile-menu" className="sm:hidden border-t border-white/10 animate-fade-in">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
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
            {/* Report Issue button for mobile */}
            <SignedIn>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setReportIssueOpen(true);
                }}
                className="flex items-center gap-3 px-4 py-3.5 w-full
                  rounded-[var(--radius-lg)] text-base font-semibold
                  text-[var(--moss-200)] hover:text-white hover:bg-white/10
                  transition-all duration-[var(--timing-fast)]
                  active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-18M3 3h12.5l-2 4 2 4H3" />
                </svg>
                <span>Report Issue</span>
              </button>
            </SignedIn>
            {/* Sign out button for mobile (shown when signed in) */}
            <SignedIn>
              <SignOutButton>
                <button
                  className="flex items-center gap-3 px-4 py-3.5 w-full
                    rounded-[var(--radius-lg)] text-base font-semibold
                    text-[var(--moss-200)] hover:text-white hover:bg-white/10
                    transition-all duration-[var(--timing-fast)]
                    active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </SignOutButton>
            </SignedIn>
          </nav>
        </div>
      )}

      {/* Accent bar at bottom */}
      <div className="h-1 bg-gradient-to-r from-[var(--moss-500)] via-[var(--forest-600)] to-[var(--moss-500)]" />

      {/* Report Issue Modal (mobile) */}
      <ReportIssueModal
        isOpen={reportIssueOpen}
        onClose={() => setReportIssueOpen(false)}
        pageUrl={typeof window !== "undefined" ? window.location.href : pathname}
      />
    </header>
  );
}
