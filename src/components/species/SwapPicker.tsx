"use client";

import Image from "next/image";
import { Photo } from "@/types";

interface SwapPickerProps {
  photos: Photo[];
  selectedPhotoId: number | null;
  onSelect: (photoId: number | null) => void;
  loading?: boolean;
}

export default function SwapPicker({
  photos,
  selectedPhotoId,
  onSelect,
  loading = false,
}: SwapPickerProps) {
  if (photos.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm font-medium text-[var(--forest-700)]">
        Select a photo to swap out
      </p>

      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo) => {
          const isSelected = selectedPhotoId === photo.id;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : photo.id)}
              disabled={loading}
              className={`relative aspect-square rounded-lg overflow-hidden
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-offset-1
                ${isSelected
                  ? "ring-2 ring-red-400 ring-offset-1 scale-95"
                  : "ring-1 ring-[var(--mist-200)] hover:ring-[var(--moss-300)] hover:scale-[1.02]"
                }
                ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <Image
                src={photo.thumbnailUrl}
                alt="Photo"
                fill
                className={`object-cover transition-all duration-150
                  ${isSelected ? "brightness-75" : ""}`}
                sizes="80px"
              />

              {/* Selected overlay with swap icon */}
              {isSelected && (
                <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Favorite indicator */}
              {photo.isFavorite && (
                <div className="absolute top-1 right-1">
                  <svg className="w-3.5 h-3.5 text-red-400 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Favorite warning */}
      {selectedPhotoId && photos.find(p => p.id === selectedPhotoId)?.isFavorite && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          This is one of your favorites
        </p>
      )}

      {/* Permanence note */}
      <p className="text-xs text-[var(--mist-400)]">
        The swapped photo will be permanently removed.
      </p>
    </div>
  );
}
