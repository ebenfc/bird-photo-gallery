const features = [
  {
    title: "Upload Your Photos",
    description: "Easily upload bird photos from your phone or computer. We extract dates from image metadata automatically.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    title: "Organize by Species",
    description: "Tag each photo with its species. Filter and browse your collection by the birds you've captured.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    title: "Create Custom Species",
    description: "Add any bird species to your personal catalogue. Track common backyard visitors or rare sightings alike.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    title: "Mark Favorites",
    description: "Highlight your best shots by marking them as favorites. Quickly filter to see your top photography.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    title: "Add Notes & Dates",
    description: "Record details about each sighting. Add notes about behavior, location, or what made the moment special.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[var(--mist-50)] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Simple tools for birders
          </h2>
          <p className="mt-4 text-lg text-[var(--mist-600)] max-w-2xl mx-auto">
            Everything you need to catalogue and curate your bird photography. Nothing you don&apos;t.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 sm:p-8 bg-[var(--card-bg)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)]
                hover:shadow-[var(--shadow-lg)] hover:ring-[var(--moss-200)]
                transition-all duration-[var(--timing-fast)]
                animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-[var(--radius-lg)]
                bg-gradient-to-br from-[var(--surface-moss)] to-[var(--surface-forest)]
                text-[var(--forest-600)] ring-1 ring-[var(--moss-200)]
                group-hover:from-[var(--moss-100)] group-hover:to-[var(--forest-100)]
                transition-colors duration-[var(--timing-fast)]">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[var(--mist-600)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
