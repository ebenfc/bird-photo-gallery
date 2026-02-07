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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Count active filters for the badge
  const activeFilterCount = (selectedSpecies ? 1 : 0) + (showFavoritesOnly ? 1 : 0) + selectedRarities.length;

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
      {/* Mobile filter toggle button */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold
            rounded-[var(--radius-lg)] border
            transition-all duration-[var(--timing-fast)] active:scale-95
            ${showMobileFilters || activeFilterCount > 0
              ? "bg-gradient-to-b from-[var(--forest-500)] to-[var(--forest-600)] text-white border-[var(--forest-600)]"
              : "bg-[var(--card-bg)] text-[var(--forest-700)] border-[var(--mist-200)] hover:border-[var(--moss-300)]"
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-[var(--card-bg)]/20">
              {activeFilterCount}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showMobileFilters ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile filters - collapsible */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-out
        ${showMobileFilters ? "max-h-96 opacity-100 mb-4" : "max-h-0 opacity-0"}`}>
        <div className="bg-[var(--card-bg)]/80 backdrop-blur-sm rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-sm)] border border-[var(--border)]">
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
      </div>

      {/* Desktop filters - always visible */}
      <div className="hidden sm:block mb-6">
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
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
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
            className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-md)]
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
            className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-[var(--radius-md)]
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
