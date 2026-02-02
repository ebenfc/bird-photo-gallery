import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--moss-50)] via-[var(--forest-50)] to-[var(--mist-50)]" />

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 pnw-texture opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--forest-900)] tracking-tight leading-tight">
              Catalogue your bird photography
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[var(--mist-600)] max-w-xl mx-auto lg:mx-0">
              A simple, focused tool for birders to organize their favorite bird photos by species.
              Upload, tag, and curate your personal collection.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold
                  bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)]
                  text-white rounded-[var(--radius-xl)]
                  shadow-[var(--shadow-md)]
                  hover:from-[var(--moss-400)] hover:to-[var(--moss-500)]
                  hover:shadow-[var(--shadow-moss-lg)] hover:-translate-y-0.5
                  active:scale-[0.96]
                  transition-all duration-[var(--timing-fast)]"
              >
                Get Started Free
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold
                  bg-white text-[var(--forest-800)]
                  border-2 border-[var(--mist-200)]
                  rounded-[var(--radius-xl)]
                  shadow-[var(--shadow-sm)]
                  hover:bg-[var(--moss-50)] hover:border-[var(--moss-300)]
                  hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5
                  active:scale-[0.96]
                  transition-all duration-[var(--timing-fast)]"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="relative aspect-[4/3] rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-2xl)] ring-1 ring-black/5">
              <Image
                src="/landing/hero-bird.jpg"
                alt="Beautiful bird photography"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[var(--moss-200)] to-[var(--forest-200)] rounded-full blur-2xl opacity-60" />
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[var(--forest-200)] to-[var(--moss-200)] rounded-full blur-3xl opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
}
