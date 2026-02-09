import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  let isAuthenticated = false;
  try {
    const { userId } = await auth();
    isAuthenticated = !!userId;
  } catch {
    isAuthenticated = false;
  }

  // Authenticated users get the full app shell from root layout (Header, main wrapper)
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Unauthenticated users get a lightweight public layout
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 bg-[var(--card-bg)] backdrop-blur-sm border-b border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-6 h-6 text-[var(--text-primary)]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <ellipse cx="11" cy="14" rx="6.5" ry="4.5" />
                <circle cx="17" cy="8" r="3" />
                <path d="M5 12C7 8.5 11 7 14.5 8L12.5 10C10 11 7.5 12 5 12Z" />
                <path d="M5.5 12L2 10.5L3 14Z" />
                <path d="M19.5 7L22.5 8L19.5 9.5Z" />
              </svg>
              <span className="font-bold text-[var(--text-primary)] text-lg">
                Bird Feed
              </span>
            </Link>

            {/* Sign In / Sign Up */}
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-[var(--mist-600)] hover:text-[var(--forest-700)]
                  transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-semibold px-4 py-2 rounded-[var(--radius-md)]
                  bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)]
                  text-white hover:from-[var(--moss-600)] hover:to-[var(--moss-700)]
                  transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
