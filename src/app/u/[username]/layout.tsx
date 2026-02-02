import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserByUsername } from "@/lib/user";
import PublicHeader from "@/components/layout/PublicHeader";

interface PublicGalleryLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export default async function PublicGalleryLayout({
  children,
  params,
}: PublicGalleryLayoutProps) {
  const { username } = await params;

  // Server-side check if gallery exists and is public
  const user = await getUserByUsername(username);

  if (!user || !user.isPublicGalleryEnabled) {
    notFound();
  }

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.username || "Bird Feed User";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <PublicHeader username={username} displayName={displayName} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Mobile CTA footer */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border-light)]
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
