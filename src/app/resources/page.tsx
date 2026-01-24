"use client";

export default function ResourcesPage() {
  const resources = [
    {
      title: "Bird Identification",
      description: "Tools and apps to help identify birds in your photos",
      links: [
        {
          name: "Merlin Bird ID",
          url: "https://merlin.allaboutbirds.org/",
          description: "Free app by Cornell Lab with photo ID, sound ID, and bird identification by answering simple questions",
        },
        {
          name: "eBird",
          url: "https://ebird.org/",
          description: "Global database of bird observations with species information and range maps",
        },
        {
          name: "iNaturalist",
          url: "https://www.inaturalist.org/",
          description: "Community-powered identification for all wildlife, including birds",
        },
      ],
    },
    {
      title: "Bird Information & Encyclopedia",
      description: "Learn more about bird species, behavior, and natural history",
      links: [
        {
          name: "All About Birds",
          url: "https://www.allaboutbirds.org/",
          description: "Comprehensive species guides from Cornell Lab with photos, sounds, ID tips, and range maps",
        },
        {
          name: "Audubon Field Guide",
          url: "https://www.audubon.org/bird-guide",
          description: "Detailed species profiles with conservation status and habitat information",
        },
        {
          name: "What Bird",
          url: "https://www.whatbird.com/",
          description: "Bird identification guide with photos, songs, and detailed species information",
        },
        {
          name: "Birds of the World",
          url: "https://birdsoftheworld.org/",
          description: "Comprehensive scientific encyclopedia (subscription required)",
        },
      ],
    },
    {
      title: "Haikubox Setup",
      description: "Automated bird detection and monitoring for your property",
      links: [
        {
          name: "Get a Haikubox",
          url: "https://haikubox.com/",
          description: "Purchase a Haikubox to automatically detect and identify birds visiting your yard 24/7",
        },
        {
          name: "Connect Haikubox to Bird Feed",
          url: "https://haikubox.com/blog/bird-feed-integration",
          description: "Learn how to connect your Haikubox to Bird Feed to automatically import bird detections and suggested photos",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Resources
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg">
            Bird Feed is an online gallery tool for cataloguing your bird activity.
            Use these resources for bird identification and in-depth species information.
          </p>
        </div>

        {/* Resource Sections */}
        <div className="space-y-8">
          {resources.map((section, idx) => (
            <section
              key={idx}
              className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
                border border-[var(--border-light)] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[var(--forest-50)] to-[var(--moss-50)]
                border-b border-[var(--border-light)] px-5 sm:px-6 py-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1">
                  {section.title}
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                  {section.description}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-5">
                  {section.links.map((link, linkIdx) => (
                    <a
                      key={linkIdx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)]
                        bg-[var(--bg-secondary)] hover:bg-[var(--forest-50)]
                        border border-[var(--border-light)] hover:border-[var(--moss-300)]
                        transition-all duration-[var(--timing-fast)]
                        hover:shadow-[var(--shadow-sm)]">

                        {/* External link icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            className="w-5 h-5 text-[var(--moss-600)] group-hover:text-[var(--moss-700)]
                              transition-colors duration-[var(--timing-fast)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--text-primary)] mb-1
                            group-hover:text-[var(--moss-700)] transition-colors duration-[var(--timing-fast)]">
                            {link.name}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-[var(--moss-50)] rounded-[var(--radius-md)]
          border border-[var(--moss-200)]">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            <span className="font-semibold text-[var(--text-primary)]">Note:</span> Bird Feed
            is designed for organizing and cataloguing your bird photos, not for detailed species
            identification or research. These external resources complement Bird Feed by providing
            expert identification tools and comprehensive species information.
          </p>
        </div>
      </div>
    </div>
  );
}
