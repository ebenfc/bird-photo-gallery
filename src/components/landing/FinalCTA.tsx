import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-[var(--forest-900)] to-[var(--forest-950)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ color: "white" }}
        >
          Start cataloguing your bird photos
        </h2>
        <p className="mt-4 text-lg text-[var(--forest-200)] max-w-xl mx-auto">
          Create your free account and begin building your personal bird photography collection today.
        </p>

        <div className="mt-10">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold
              bg-white text-[var(--forest-900)]
              rounded-[var(--radius-xl)]
              shadow-[var(--shadow-lg)]
              hover:bg-[var(--moss-50)]
              hover:shadow-[var(--shadow-xl)] hover:-translate-y-0.5
              active:scale-[0.96]
              transition-all duration-[var(--timing-fast)]"
          >
            Create Free Account
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--forest-800)]">
          <p className="text-sm text-[var(--forest-200)]">
            Made with care in the Pacific Northwest
          </p>
          <p className="mt-2 text-xs text-[var(--forest-300)]">
            &copy; {new Date().getFullYear()} Bird Feed
          </p>
        </div>
      </div>
    </section>
  );
}
