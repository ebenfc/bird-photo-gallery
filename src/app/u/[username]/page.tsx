"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Photo, PhotosResponse, Species } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type SortOption = "recent_upload" | "oldest_upload" | "species_alpha" | "recent_taken";
type Rarity = "common" | "uncommon" | "rare";

export default function PublicFeedPage() {
  const params = useParams();
  const username = params.username as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageRef = useRef(1);
  const fetchInProgressRef = useRef(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Filter state
  const [selectedSpecies, setSelectedSpecies] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("recent_upload");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Recently Added state
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);

  // Count active filters for the badge
  const activeFilterCount = (selectedSpecies ? 1 : 0) + (showFavoritesOnly ? 1 : 0) + selectedRarities.length;
  const hasActiveFilters = activeFilterCount > 0 || sortOption !== "recent_upload";

  // Fetch species for filter dropdown + recently added photos
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
    const fetchRecentPhotos = async () => {
      try {
        const res = await fetch(
          `/api/public/gallery/${username}/photos?sort=recent_upload&limit=6`
        );
        if (res.ok) {
          const data: PhotosResponse = await res.json();
          setRecentPhotos(data.photos);
        }
      } catch (error) {
        console.error("Failed to fetch recent photos:", error);
      }
    };
    fetchSpecies();
    fetchRecentPhotos();
  }, [username]);

  // Fetch photos (page 1 = replace, page 2+ = append)
  const fetchPhotos = useCallback(async (page: number, append: boolean) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (selectedSpecies) params.set("speciesId", selectedSpecies.toString());
      if (showFavoritesOnly) params.set("favorites", "true");
      if (selectedRarities.length > 0) params.set("rarity", selectedRarities.join(","));
      params.set("sort", sortOption);
      params.set("page", page.toString());
      params.set("limit", "50");

      const res = await fetch(`/api/public/gallery/${username}/photos?${params.toString()}`);
      if (res.ok) {
        const data: PhotosResponse = await res.json();
        if (append) {
          setPhotos(prev => [...prev, ...(data.photos || [])]);
        } else {
          setPhotos(data.photos || []);
        }
        pageRef.current = data.page;
        setTotalPages(data.totalPages);
        setTotalPhotos(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [username, selectedSpecies, showFavoritesOnly, selectedRarities, sortOption]);

  // Fetch page 1 when filters/sort change
  useEffect(() => {
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  // Infinite scroll
  const hasMore = pageRef.current < totalPages;
  const loadMore = useCallback(() => {
    if (fetchInProgressRef.current) return;
    fetchPhotos(pageRef.current + 1, true);
  }, [fetchPhotos]);
  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore, loading: loadingMore });

  // Photo navigation
  const currentPhotoIndex = selectedPhoto
    ? photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handleNavigate = useCallback((direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;

    // Prefetch next page when approaching end of loaded photos
    if (direction === "next" && currentIndex >= photos.length - 5 && hasMore && !loadingMore) {
      loadMore();
    }

    const newPhoto = photos[newIndex];
    if (newIndex >= 0 && newIndex < photos.length && newPhoto) {
      setSelectedPhoto(newPhoto);
    }
  }, [selectedPhoto, photos, hasMore, loadingMore, loadMore]);

  const canNavigate = {
    prev: currentPhotoIndex > 0,
    next: currentPhotoIndex < photos.length - 1 || hasMore,
  };

  const adjacentPhotos = selectedPhoto && currentPhotoIndex >= 0
    ? {
        prev: currentPhotoIndex > 0
          ? { originalUrl: photos[currentPhotoIndex - 1]!.originalUrl, alt: photos[currentPhotoIndex - 1]!.species?.commonName || "Bird photo" }
          : null,
        next: currentPhotoIndex < photos.length - 1
          ? { originalUrl: photos[currentPhotoIndex + 1]!.originalUrl, alt: photos[currentPhotoIndex + 1]!.species?.commonName || "Bird photo" }
          : null,
      }
    : undefined;

  return (
    <div className="pb-16 md:pb-0">
      {/* Recently Added — only shown on unfiltered default view */}
      {!hasActiveFilters && recentPhotos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--mist-500)] uppercase tracking-wider mb-3">
            Recently Added
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch" }}>
            {recentPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="flex-shrink-0 relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px]
                  rounded-[var(--radius-lg)] overflow-hidden
                  ring-1 ring-[var(--border)]
                  shadow-[var(--shadow-sm)]
                  transition-all duration-[var(--timing-fast)]
                  hover:shadow-[var(--shadow-lg)] hover:ring-2 hover:ring-[var(--moss-300)]
                  hover:-translate-y-0.5
                  active:scale-[0.97]
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--moss-500)]"
              >
                <Image
                  src={photo.thumbnailUrl}
                  alt={photo.species?.commonName || "Bird photo"}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
                {photo.species && (
                  <div className="absolute bottom-0 left-0 right-0
                    bg-gradient-to-t from-black/70 to-transparent
                    p-2 pt-6">
                    <p className="text-white text-xs font-medium truncate drop-shadow-sm">
                      {photo.species.commonName}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Infinite scroll sentinel + loading indicator */}
      {!loading && (
        <>
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-[var(--mist-500)]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading more photos...
              </div>
            </div>
          )}
          {hasMore && !loadingMore && (
            <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          )}
          {!hasMore && totalPhotos > 50 && (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--mist-400)]">
                All {totalPhotos} photos loaded
              </p>
            </div>
          )}
        </>
      )}

      {/* Photo Modal - Read Only */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onNavigate={handleNavigate}
          canNavigate={canNavigate}
          adjacentPhotos={adjacentPhotos}
          readOnly
        />
      )}
    </div>
  );
}
