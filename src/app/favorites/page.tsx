"use client";

import { useState, useEffect } from "react";
import { Photo, PhotosResponse } from "@/types";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import PhotoModal from "@/components/gallery/PhotoModal";

export default function FavoritesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/api/photos?favorites=true")
      .then((res) => res.json())
      .then((data: PhotosResponse) => {
        setPhotos(data.photos);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleFavoriteToggle = async (id: number, isFavorite: boolean) => {
    try {
      await fetch(`/api/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite }),
      });

      if (!isFavorite) {
        // Remove from list if unfavorited
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        if (selectedPhoto?.id === id) {
          setSelectedPhoto(null);
        }
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

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

  return (
    <div className="pnw-texture min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--forest-900)]">Favorites</h1>
          <p className="text-[var(--mist-500)] mt-1">
            Your favorite bird photos
          </p>
        </div>
        <span className="text-sm text-[var(--mist-500)] px-3 py-1 bg-[var(--moss-50)] rounded-full">
          {photos.length} photo{photos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--forest-800)] mb-2">
            No favorites yet
          </h3>
          <p className="text-[var(--mist-500)] max-w-sm mx-auto">
            Click the heart icon on any photo to add it to your favorites
          </p>
        </div>
      ) : (
        <PhotoGrid photos={photos} onPhotoClick={setSelectedPhoto} />
      )}

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onFavoriteToggle={handleFavoriteToggle}
        onNavigate={handleNavigate}
        canNavigate={canNavigate}
      />
    </div>
  );
}
