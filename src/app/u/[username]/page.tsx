"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Photo, PhotosResponse, Species } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import GalleryFilters from "@/components/gallery/GalleryFilters";

type SortOption = "recent_upload" | "oldest_upload" | "species_alpha" | "recent_taken";
type Rarity = "common" | "uncommon" | "rare";

export default function PublicFeedPage() {
  const params = useParams();
  const username = params.username as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Filter state
  const [selectedSpecies, setSelectedSpecies] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("recent_upload");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch species for filter dropdown
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const res = await fetch(`/api/public/gallery/${username}/species`);
        if (res.ok) {
          const data = await res.json();
          setSpeciesList(data.species);
        }
      } catch (error) {
        console.error("Failed to fetch species:", error);
      }
    };
    fetchSpecies();
  }, [username]);

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecies) params.set("speciesId", selectedSpecies.toString());
      if (showFavoritesOnly) params.set("favorites", "true");
      if (selectedRarities.length > 0) params.set("rarity", selectedRarities.join(","));
      params.set("sort", sortOption);
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
  }, [username, selectedSpecies, showFavoritesOnly, selectedRarities, sortOption, currentPage]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecies, showFavoritesOnly, selectedRarities, sortOption]);

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
      {/* Filters */}
      <div className="mb-6">
        <GalleryFilters
          species={speciesList}
          selectedSpecies={selectedSpecies}
          onSpeciesChange={setSelectedSpecies}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesChange={setShowFavoritesOnly}
          selectedRarities={selectedRarities}
          onRarityChange={setSelectedRarities}
          sortOption={sortOption}
          onSortChange={(sort) => setSortOption(sort as SortOption)}
        />
      </div>

      {/* Photo Grid */}
      <PhotoGrid
        photos={photos}
        onPhotoClick={setSelectedPhoto}
        loading={loading}
        showSpecies={!selectedSpecies}
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
            No photos found
          </h3>
          <p className="text-[var(--mist-600)]">
            {selectedSpecies || showFavoritesOnly || selectedRarities.length > 0
              ? "Try adjusting your filters"
              : "This gallery doesn't have any photos yet"}
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
