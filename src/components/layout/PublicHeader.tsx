"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PublicHeaderProps {
  username: string;
  displayName: string;
}

export default function PublicHeader({ username, displayName }: PublicHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/u/${username}`, label: "Feed", icon: PhotoIcon },
    { href: `/u/${username}/species`, label: "Species", icon: SpeciesIcon },
  ];

  const isActive = (href: string) => {
    if (href === `/u/${username}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Gallery Title */}
          <div className="flex items-center gap-3">
            <Link
              href={`/u/${username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-6 h-6 text-[var(--forest-900)]"
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
              <h1 className="font-bold text-[var(--forest-900)] text-lg leading-tight">
                {displayName}&apos;s Bird Feed
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]
                    font-medium text-sm transition-all duration-[var(--timing-fast)]
                    ${
                      active
                        ? "bg-[var(--moss-100)] text-[var(--moss-700)]"
                        : "text-[var(--mist-600)] hover:bg-[var(--mist-50)] hover:text-[var(--forest-700)]"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Create your own CTA */}
          <div className="hidden md:block">
            <Link
              href="/"
              className="text-sm text-[var(--mist-500)] hover:text-[var(--forest-600)]
                transition-colors flex items-center gap-1"
            >
              <span>Create your own</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// Icon components
function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function SpeciesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}
