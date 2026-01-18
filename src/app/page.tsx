"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Photo, Species, PhotosResponse, SpeciesResponse } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import SpeciesAssignModal from "@/components/species/SpeciesAssignModal";

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoToAssign, setPhotoToAssign] = useState<Photo | null>(null);

  // Get filter state from URL
  const selectedSpecies = searchParams.get("species")
    ? parseInt(searchParams.get("species")!)
    : null;
  const showFavoritesOnly = searchParams.get("favorites") === "true";

  // Update URL with filter state
  const updateFilters = useCallback(
    (newSpecies: number | null, newFavorites: boolean) => {
      const params = new URLSearchParams();
      if (newSpecies) params.set("species", newSpecies.toString());
      if (newFavorites) params.set("favorites", "true");
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

    try {
      const res = await fetch(`/api/photos?${params.toString()}`);
      const data: PhotosResponse = await res.json();
      setPhotos(data.photos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSpecies, showFavoritesOnly]);

  const fetchSpecies = async () => {
    try {
      const res = await fetch("/api/species");
      const data: SpeciesResponse = await res.json();
      setSpecies(data.species);
    } catch (err) {
      console.error(err);
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
    speciesData: { commonName: string; scientificName?: string }
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
      setSelectedPhoto(photos[newIndex]);
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

  return (
    <div className="pnw-texture min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[var(--forest-900)]">Photo Gallery</h1>
        <span className="text-sm text-[var(--mist-500)] px-3 py-1 bg-[var(--moss-50)] rounded-full">
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </span>
      </div>

      <GalleryFilters
        species={species}
        selectedSpecies={selectedSpecies}
        showFavoritesOnly={showFavoritesOnly}
        onSpeciesChange={(id) => updateFilters(id, showFavoritesOnly)}
        onFavoritesChange={(value) => updateFilters(selectedSpecies, value)}
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
      />

      <SpeciesAssignModal
        photo={photoToAssign}
        species={species}
        isOpen={photoToAssign !== null}
        onClose={() => setPhotoToAssign(null)}
        onAssign={handleAssignSpecies}
        onCreateAndAssign={handleCreateAndAssign}
      />
    </div>
  );
}

function GalleryLoading() {
  return (
    <div className="pnw-texture min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-40 bg-gradient-to-r from-[var(--moss-100)] to-[var(--mist-100)] rounded-xl animate-pulse" />
        <div className="h-6 w-24 bg-gradient-to-r from-[var(--moss-50)] to-[var(--mist-50)] rounded-full animate-pulse" />
      </div>
      <div className="h-10 w-64 bg-gradient-to-r from-[var(--moss-50)] to-[var(--mist-50)] rounded-xl animate-pulse mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] rounded-2xl animate-pulse"
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
