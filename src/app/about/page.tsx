"use client";

export default function AboutPage() {
  const howToItems = [
    {
      title: "Upload Photos",
      description:
        "Snap a photo of a backyard visitor and upload it to your feed. Bird Feed supports common image formats and makes it easy to build your collection over time.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Catalog by Species",
      description:
        "Tag your photos with species names to build your own personal field guide. Filter and browse by species to see all your sightings in one place.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Track Activity",
      description:
        "Connect a Haikubox device to automatically detect and identify birds visiting your yard. See which species are showing up, even when you're not watching.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ),
    },
    {
      title: "Share Your Gallery",
      description:
        "Enable your public gallery and share a link with fellow birders, friends, and family. Let others enjoy the birds that visit your corner of the world.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pnw-texture min-h-screen pb-24 sm:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight mb-2">
          About Us
        </h1>
        <p className="text-[var(--mist-600)]">
          The story behind Bird Feed and how to get the most out of it.
        </p>
      </div>

      {/* Who We Are */}
      <section className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
        border border-[var(--border-light)] overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[var(--moss-50)] to-[var(--forest-50)]
          border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--forest-900)] mb-1 flex items-center gap-2">
            <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Who We Are
          </h2>
          <p className="text-sm sm:text-base text-[var(--mist-600)]">
            Backyard birders, not professional developers or ornithologists
          </p>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-[var(--mist-700)] leading-relaxed">
            We&apos;re hobbyists who love watching birds from our backyards. Whether it&apos;s
            filling feeders, setting up birdbaths, or just sitting quietly with a cup of coffee
            and waiting to see who shows up &mdash; there&apos;s something deeply satisfying about
            getting to know the birds that share your little patch of the world.
          </p>
          <p className="text-[var(--mist-700)] leading-relaxed">
            Bird Feed was born out of that love. We wanted a simple, no-fuss way to catalog the
            birds visiting our yards and share those moments with friends and family. No PhD required,
            no complicated field research tools &mdash; just a straightforward place to keep track of
            your feathered visitors and enjoy the hobby.
          </p>
        </div>
      </section>

      {/* How to Use Bird Feed */}
      <section className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
        border border-[var(--border-light)] overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[var(--forest-50)] to-[var(--moss-50)]
          border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--forest-900)] mb-1 flex items-center gap-2">
            <svg className="w-6 h-6 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            How to Use Bird Feed
          </h2>
          <p className="text-sm sm:text-base text-[var(--mist-600)]">
            Getting started is simple &mdash; here&apos;s what you can do
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {howToItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-[var(--radius-md)]
                  bg-[var(--bg-secondary)] border border-[var(--border-light)]"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)]
                  bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)]
                  flex items-center justify-center text-[var(--moss-600)]">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--forest-900)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--mist-600)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-[var(--moss-50)] rounded-[var(--radius-md)]
        border border-[var(--moss-200)]">
        <p className="text-sm text-[var(--mist-600)] text-center leading-relaxed">
          Bird Feed was built in the <span className="font-semibold text-[var(--forest-900)]">Pacific Northwest</span> by
          backyard bird enthusiasts and was proudly vibe-coded
          with <span className="font-semibold text-[var(--forest-900)]">Claude</span>, Anthropic&apos;s AI assistant.
          We&apos;re not professionals &mdash; just folks who love birds and thought it&apos;d be fun to build something.
        </p>
      </div>
    </div>
  );
}
