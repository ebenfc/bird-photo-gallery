import Image from "next/image";

const showcasePhotos = [
  { src: "/landing/showcase-1.jpg", alt: "Colorful bird perched on branch" },
  { src: "/landing/showcase-2.jpg", alt: "Bird in flight" },
  { src: "/landing/showcase-3.jpg", alt: "Bird at feeder" },
  { src: "/landing/showcase-4.jpg", alt: "Hummingbird hovering" },
  { src: "/landing/showcase-6.jpg", alt: "Songbird singing" },
];

export default function PhotoShowcase() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--forest-900)] tracking-tight">
            Build your personal collection
          </h2>
          <p className="mt-4 text-lg text-[var(--mist-600)] max-w-2xl mx-auto">
            Every birder has their favorite shots. Create a beautiful gallery organized by the species you love.
          </p>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {showcasePhotos.map((photo, index) => (
            <div
              key={photo.src}
              className="group relative aspect-square rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-md)] ring-1 ring-black/5
                animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-[var(--timing-normal)] group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--timing-fast)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
