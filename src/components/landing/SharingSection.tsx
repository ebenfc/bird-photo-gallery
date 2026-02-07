const sharingFeatures = [
  {
    title: "Share Your Gallery",
    description:
      "Get a unique link to your bird feed. Anyone with the link can browse your photos, species, and notes — no account needed.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.798"
        />
      </svg>
    ),
  },
  {
    title: "Discover Other Birders",
    description:
      "Browse galleries from birders across the country. Filter by state to find birders in your area. Save your favorites for quick access.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.559"
        />
      </svg>
    ),
  },
  {
    title: "You're in Control",
    description:
      "Choose to share via link only, or opt into the public directory. Change your mind anytime — revoke access instantly.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
];

export default function SharingSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--forest-900)] tracking-tight">
            Share what you love
          </h2>
          <p className="mt-4 text-lg text-[var(--mist-600)] max-w-2xl mx-auto">
            Your gallery is yours. Share it with a link, explore other
            birders&apos; collections, or keep it completely private. No
            followers, no likes — just birds.
          </p>
        </div>

        {/* Sharing features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sharingFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 sm:p-8 bg-white rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]
                hover:shadow-[var(--shadow-lg)] hover:ring-[var(--moss-200)]
                transition-all duration-[var(--timing-fast)]
                animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded-[var(--radius-lg)]
                bg-gradient-to-br from-[var(--moss-50)] to-[var(--forest-50)]
                text-[var(--forest-600)] ring-1 ring-[var(--moss-200)]
                group-hover:from-[var(--moss-100)] group-hover:to-[var(--forest-100)]
                transition-colors duration-[var(--timing-fast)]"
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="mt-5 text-lg font-semibold text-[var(--forest-900)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[var(--mist-600)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Philosophy line */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-sm text-[var(--mist-500)]">
            Bird Feed is intentionally non-social. No popularity metrics, no
            algorithms, no pressure. Just birders sharing what they see.
          </p>
        </div>
      </div>
    </section>
  );
}
