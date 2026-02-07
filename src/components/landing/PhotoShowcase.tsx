import Image from "next/image";

const showcasePhotos = [
  { src: "/landing/showcase-1.jpg", alt: "Blue Jay perched on a branch", commonName: "Blue Jay", scientificName: "Cyanocitta cristata" },
  { src: "/landing/showcase-2.jpg", alt: "American Robin standing in the grass", commonName: "American Robin", scientificName: "Turdus migratorius" },
  { src: "/landing/showcase-4.jpg", alt: "Black-capped Chickadee on a branch", commonName: "Black-capped Chickadee", scientificName: "Poecile atricapillus" },
  { src: "/landing/showcase-6.jpg", alt: "American Goldfinch on wildflowers", commonName: "American Goldfinch", scientificName: "Spinus tristis" },
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
            Every birder has their favorite shots. Create a beautiful gallery organized by the species you love — then share it with a unique link.
          </p>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
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
              {/* Species name overlay - matches logged-in gallery hover */}
              <div className="absolute bottom-0 left-0 right-0
                bg-gradient-to-t from-[var(--forest-950)]/90 via-[var(--forest-950)]/60 to-transparent
                p-3.5 pt-12
                opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                transition-all duration-[var(--timing-normal)]">
                <p className="text-white text-sm font-semibold truncate drop-shadow-sm">
                  {photo.commonName}
                </p>
                <p className="text-white/75 text-xs italic truncate">
                  {photo.scientificName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
