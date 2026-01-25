"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Photo, Species, PhotosResponse, SpeciesResponse, Rarity } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import SpeciesAssignModal from "@/components/species/SpeciesAssignModal";
import UploadModal from "@/components/upload/UploadModal";
import Button from "@/components/ui/Button";

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoToAssign, setPhotoToAssign] = useState<Photo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sortOption, setSortOption] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gallerySortPreference") || "recent_upload";
    }
    return "recent_upload";
  });

  // Get filter state from URL (memoized to prevent infinite loops)
  const selectedSpecies = searchParams.get("species")
    ? parseInt(searchParams.get("species")!)
    : null;
  const showFavoritesOnly = searchParams.get("favorites") === "true";
  const rarityParam = searchParams.get("rarity");
  const selectedRarities: Rarity[] = useMemo(() => {
    if (!rarityParam) return [];
    return rarityParam.split(",").filter((r) =>
      ["common", "uncommon", "rare"].includes(r)
    ) as Rarity[];
  }, [rarityParam]);

  // Update URL with filter state
  const updateFilters = useCallback(
    (newSpecies: number | null, newFavorites: boolean, newRarities: Rarity[]) => {
      const params = new URLSearchParams();
      if (newSpecies) params.set("species", newSpecies.toString());
      if (newFavorites) params.set("favorites", "true");
      if (newRarities.length > 0) params.set("rarity", newRarities.join(","));
      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : "/");
    },
    [router]
  );

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedSpecies) params.set("speciesId", selectedSpecies.toString());
    if (showFavoritesOnly) params.set("favorites", "true");
    if (selectedRarities.length > 0) params.set("rarity", selectedRarities.join(","));
    params.set("sort", sortOption);

    try {
      const res = await fetch(`/api/photos?${params.toString()}`);
      const data: PhotosResponse = await res.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error(err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSpecies, showFavoritesOnly, selectedRarities, sortOption]);

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    if (typeof window !== "undefined") {
      localStorage.setItem("gallerySortPreference", newSort);
    }
  };

  const fetchSpecies = async () => {
    try {
      const res = await fetch("/api/species");
      const data: SpeciesResponse = await res.json();
      setSpecies(data.species || []);
    } catch (err) {
      console.error(err);
      setSpecies([]);
    }
  };

  // Fetch species list
  useEffect(() => {
    fetchSpecies();
  }, []);

  // Fetch photos based on filters
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Handle favorite toggle
  const handleFavoriteToggle = async (id: number, isFavorite: boolean) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });

      // Update local state
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFavorite } : p))
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto((prev) => (prev ? { ...prev, isFavorite } : null));
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  // Handle species assignment
  const handleAssignSpecies = async (photoId: number, speciesId: number) => {
    await fetch(`/api/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speciesId }),
    });

    // Refresh photos and species
    await Promise.all([fetchPhotos(), fetchSpecies()]);

    // Update selected photo if it was the one being assigned
    if (selectedPhoto?.id === photoId) {
      const updatedSpecies = species.find((s) => s.id === speciesId);
      if (updatedSpecies) {
        setSelectedPhoto((prev) =>
          prev
            ? {
                ...prev,
                species: {
                  id: updatedSpecies.id,
                  commonName: updatedSpecies.commonName,
                  scientificName: updatedSpecies.scientificName,
                  rarity: updatedSpecies.rarity,
                },
              }
            : null
        );
      }
    }

    setPhotoToAssign(null);
  };

  const handleCreateAndAssign = async (
    photoId: number,
    speciesData: { commonName: string; scientificName?: string; rarity?: Rarity }
  ) => {
    // Create species
    const createRes = await fetch("/api/species", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(speciesData),
    });
    const { species: newSpecies } = await createRes.json();

    // Assign to photo
    await handleAssignSpecies(photoId, newSpecies.id);
  };

  // Photo navigation in modal
  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < photos.length) {
      const newPhoto = photos[newIndex];
      if (newPhoto) {
        setSelectedPhoto(newPhoto);
      }
    }
  };

  const canNavigate = selectedPhoto
    ? {
        prev: photos.findIndex((p) => p.id === selectedPhoto.id) > 0,
        next:
          photos.findIndex((p) => p.id === selectedPhoto.id) < photos.length - 1,
      }
    : { prev: false, next: false };

  const handleChangeSpecies = (photo: Photo) => {
    setPhotoToAssign(photo);
  };

  // Handle date change
  const handleDateChange = async (id: number, date: string | null) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalDateTaken: date }),
      });

      // Update local state
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, originalDateTaken: date, dateTakenSource: "manual" as const }
            : p
        )
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto((prev) =>
          prev ? { ...prev, originalDateTaken: date, dateTakenSource: "manual" as const } : null
        );
      }
    } catch (err) {
      console.error("Failed to update date:", err);
    }
  };

  // Handle notes change
  const handleNotesChange = async (id: number, notes: string | null) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      // Update local state
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, notes } : p))
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto((prev) => (prev ? { ...prev, notes } : null));
      }
    } catch (err) {
      console.error("Failed to update notes:", err);
    }
  };

  // Handle photo delete
  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "DELETE",
      });

      // Remove from local state
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setSelectedPhoto(null);

      // Refresh species counts
      await fetchSpecies();
    } catch (err) {
      console.error("Failed to delete photo:", err);
    }
  };

  // Handle set cover photo
  const handleSetCoverPhoto = async (photoId: number, speciesId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/species/${speciesId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhotoId: photoId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to set cover photo:", errorData.error);
        return false;
      }

      // Refresh species to get updated cover photos
      await fetchSpecies();
      return true;
    } catch (err) {
      console.error("Failed to set cover photo:", err);
      return false;
    }
  };

  return (
    <div className="pnw-texture min-h-screen pb-24 sm:pb-0">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-900)] tracking-tight">
            Gallery
          </h1>
          <p className="text-[var(--mist-600)] mt-1">
            Browse, upload, and organize your bird photography collection.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/species')}
            className="text-xs sm:text-sm font-semibold text-[var(--forest-700)] px-3 sm:px-4 py-1.5
              bg-gradient-to-br from-[var(--moss-50)] to-[var(--forest-50)]
              rounded-full shadow-[var(--shadow-xs)] ring-1 ring-[var(--border)]
              hover:shadow-[var(--shadow-sm)] hover:ring-[var(--moss-300)]
              transition-all duration-[var(--timing-fast)] active:scale-95 cursor-pointer"
          >
            {species.filter(s => s.photoCount && s.photoCount > 0).length} species
          </button>
          <span className="text-xs sm:text-sm font-semibold text-[var(--forest-700)] px-3 sm:px-4 py-1.5
            bg-gradient-to-br from-[var(--moss-50)] to-[var(--forest-50)]
            rounded-full shadow-[var(--shadow-xs)] ring-1 ring-[var(--border)]">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
          {/* Upload button - hidden on mobile, FAB shown instead */}
          <Button onClick={() => setShowUploadModal(true)} className="hidden sm:flex">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </Button>
        </div>
      </div>

      <GalleryFilters
        species={species}
        selectedSpecies={selectedSpecies}
        showFavoritesOnly={showFavoritesOnly}
        selectedRarities={selectedRarities}
        sortOption={sortOption}
        onSpeciesChange={(id) => updateFilters(id, showFavoritesOnly, selectedRarities)}
        onFavoritesChange={(value) => updateFilters(selectedSpecies, value, selectedRarities)}
        onRarityChange={(rarities) => updateFilters(selectedSpecies, showFavoritesOnly, rarities)}
        onSortChange={handleSortChange}
      />

      <PhotoGrid
        photos={photos}
        onPhotoClick={setSelectedPhoto}
        loading={loading}
      />

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onFavoriteToggle={handleFavoriteToggle}
        onNavigate={handleNavigate}
        canNavigate={canNavigate}
        onChangeSpecies={handleChangeSpecies}
        onDateChange={handleDateChange}
        onNotesChange={handleNotesChange}
        onDelete={handleDelete}
        onSetCoverPhoto={handleSetCoverPhoto}
      />

      <SpeciesAssignModal
        photo={photoToAssign}
        species={species}
        isOpen={photoToAssign !== null}
        onClose={() => setPhotoToAssign(null)}
        onAssign={handleAssignSpecies}
        onCreateAndAssign={handleCreateAndAssign}
      />

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        species={species}
        onUploadComplete={() => {
          fetchPhotos();
          fetchSpecies();
        }}
        onSpeciesCreated={fetchSpecies}
      />

      {/* Floating Action Button for mobile */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16
          bg-gradient-to-br from-[var(--moss-500)] to-[var(--forest-600)]
          text-white rounded-full
          shadow-[var(--shadow-moss-lg)]
          hover:shadow-[0_12px_32px_rgba(124,179,66,0.35)]
          hover:scale-110 hover:-translate-y-1
          active:scale-95
          transition-all duration-[var(--timing-fast)]
          flex items-center justify-center sm:hidden z-40"
        aria-label="Upload photo"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

function GalleryLoading() {
  return (
    <div className="pnw-texture min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="h-9 w-44 skeleton" />
        <div className="h-8 w-28 skeleton rounded-full" />
      </div>
      <div className="flex gap-3 mb-6">
        <div className="h-12 w-48 skeleton" />
        <div className="h-12 w-48 skeleton" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-[var(--radius-xl)] skeleton"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent />
    </Suspense>
  );
}
