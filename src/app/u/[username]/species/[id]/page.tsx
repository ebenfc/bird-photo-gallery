"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Photo, PhotosResponse, Species } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import RarityBadge from "@/components/ui/RarityBadge";

export default function PublicSpeciesDetailPage() {
  const params = useParams();
  const username = params.username as string;
  const speciesId = params.id as string;

  const [species, setSpecies] = useState<Species | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch species details
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const res = await fetch(`/api/public/gallery/${username}/species/${speciesId}`);
        if (res.ok) {
          const data = await res.json();
          setSpecies(data.species);
        }
      } catch (error) {
        console.error("Failed to fetch species:", error);
      }
    };
    fetchSpecies();
  }, [username, speciesId]);

  // Fetch photos for this species
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("speciesId", speciesId);
      params.set("page", currentPage.toString());
      params.set("limit", "50");

      const res = await fetch(`/api/public/gallery/${username}/photos?${params.toString()}`);
      if (res.ok) {
        const data: PhotosResponse = await res.json();
        setPhotos(data.photos);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  }, [username, speciesId, currentPage]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Photo navigation
  const currentPhotoIndex = selectedPhoto
    ? photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const newIndex = direction === "prev" ? currentPhotoIndex - 1 : currentPhotoIndex + 1;
    const newPhoto = photos[newIndex];
    if (newIndex >= 0 && newIndex < photos.length && newPhoto) {
      setSelectedPhoto(newPhoto);
    }
  };

  const canNavigate = {
    prev: currentPhotoIndex > 0,
    next: currentPhotoIndex < photos.length - 1,
  };

  return (
    <div className="pb-16 md:pb-0">
      {/* Back link */}
      <Link
        href={`/u/${username}/species`}
        className="inline-flex items-center gap-2 text-sm text-[var(--mist-600)]
          hover:text-[var(--forest-700)] mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to species
      </Link>

      {/* Species Header */}
      {species && (
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--border-light)]
          p-5 sm:p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] mb-1">
                {species.commonName}
              </h1>
              {species.scientificName && (
                <p className="text-[var(--mist-500)] italic mb-3">
                  {species.scientificName}
                </p>
              )}
              {species.description && (
                <p className="text-[var(--mist-600)] leading-relaxed max-w-2xl">
                  {species.description}
                </p>
              )}
            </div>
            <RarityBadge rarity={species.rarity} />
          </div>

          {/* External link */}
          <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
            <a
              href={`https://www.allaboutbirds.org/guide/${species.commonName.replace(/\s+/g, "_")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--forest-600)]
                hover:text-[var(--moss-600)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Learn more at All About Birds
            </a>
          </div>
        </div>
      )}

      {/* Photo count */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--forest-900)]">
          Photos ({species?.photoCount || 0})
        </h2>
      </div>

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos}
        onPhotoClick={setSelectedPhoto}
        loading={loading}
        showSpecies={false}
      />

      {/* Empty State */}
      {!loading && photos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mist-100)]
            flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--mist-400)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--forest-900)] mb-1">
            No photos yet
          </h3>
          <p className="text-[var(--mist-600)]">
            This species doesn&apos;t have any photos in this gallery
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-[var(--border-light)] rounded-[var(--radius-md)]
              text-sm font-medium text-[var(--forest-700)] hover:bg-[var(--mist-50)]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-[var(--mist-600)]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-[var(--border-light)] rounded-[var(--radius-md)]
              text-sm font-medium text-[var(--forest-700)] hover:bg-[var(--mist-50)]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Photo Modal - Read Only */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={handleNavigate}
          canNavigate={canNavigate}
          readOnly
        />
      )}
    </div>
  );
}
