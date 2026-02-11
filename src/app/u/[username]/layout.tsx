import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCachedUserByUsername, getDisplayName } from "@/lib/user";
import PublicHeader from "@/components/layout/PublicHeader";
import BookmarkButton from "@/components/discover/BookmarkButton";

// Request-level deduplication: generateMetadata and component body
// share the same cached result within a single server render
const getUser = cache((username: string) => getCachedUserByUsername(username));

interface PublicGalleryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PublicGalleryLayoutProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  const displayName = user ? getDisplayName(user) : username;
  return {
    title: `${displayName}'s Gallery | Bird Feed`,
  };
}

export default async function PublicGalleryLayout({
  children,
  params,
}: PublicGalleryLayoutProps) {
  const { username } = await params;

  // Server-side check if gallery exists and is public
  const user = await getUser(username);

  if (!user || !user.isPublicGalleryEnabled) {
    notFound();
  }

  const displayName = getDisplayName(user);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <PublicHeader username={username} displayName={displayName}>
        <BookmarkButton username={username} />
      </PublicHeader>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Mobile CTA footer */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--card-bg)] border-t border-[var(--border-light)]
        py-3 px-4 text-center">
        <Link
          href="/"
          className="text-sm text-[var(--forest-600)] font-medium hover:text-[var(--moss-600)]"
        >
          Create your own Bird Feed
        </Link>
      </footer>
    </div>
  );
}
