"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Photo } from "@/types";

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
  onFavoriteToggle: (id: number, isFavorite: boolean) => void;
  onNavigate?: (direction: "prev" | "next") => void;
  canNavigate?: { prev: boolean; next: boolean };
  onChangeSpecies?: (photo: Photo) => void;
  onDateChange?: (id: number, date: string | null) => Promise<void>;
}

export default function PhotoModal({
  photo,
  onClose,
  onFavoriteToggle,
  onNavigate,
  canNavigate = { prev: false, next: false },
  onChangeSpecies,
  onDateChange,
}: PhotoModalProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDateValue, setEditDateValue] = useState("");
  const [isSavingDate, setIsSavingDate] = useState(false);

  // Reset edit state when photo changes
  useEffect(() => {
    setIsEditingDate(false);
    setEditDateValue("");
  }, [photo?.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onNavigate && canNavigate.prev) {
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && onNavigate && canNavigate.next) {
        onNavigate("next");
      }
    },
    [onClose, onNavigate, canNavigate]
  );

  useEffect(() => {
    if (photo) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [photo, handleKeyDown]);

  if (!photo) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--forest-950)]/95" onClick={onClose} />

      {/* Content */}
      <div className="relative flex flex-col lg:flex-row w-full h-full">
        {/* Image container */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
          {/* Close button - positioned over the image area */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation arrows */}
          {onNavigate && canNavigate.prev && (
            <button
              onClick={() => onNavigate("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {onNavigate && canNavigate.next && (
            <button
              onClick={() => onNavigate("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
            <Image
              src={photo.originalUrl}
              alt={photo.species?.commonName || "Bird photo"}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 80vw"
              priority
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 bg-white lg:rounded-l-2xl p-6 overflow-auto shadow-2xl">
          {/* Close button for mobile (in sidebar) */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-2 right-2 p-2 text-[var(--mist-400)] hover:text-[var(--mist-600)] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {photo.species ? (
                <>
                  <h2 className="text-xl font-semibold text-[var(--forest-900)]">
                    {photo.species.commonName}
                  </h2>
                  {photo.species.scientificName && (
                    <p className="text-[var(--mist-500)] italic">
                      {photo.species.scientificName}
                    </p>
                  )}
                  {onChangeSpecies && (
                    <button
                      onClick={() => onChangeSpecies(photo)}
                      className="text-sm text-[var(--moss-600)] hover:text-[var(--moss-700)] underline mt-1 transition-colors"
                    >
                      Change species
                    </button>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-amber-600">
                    Species Unassigned
                  </h2>
                  {onChangeSpecies ? (
                    <button
                      onClick={() => onChangeSpecies(photo)}
                      className="text-sm text-amber-600 hover:text-amber-700 underline transition-colors"
                    >
                      Assign species
                    </button>
                  ) : (
                    <Link
                      href="/inbox"
                      onClick={onClose}
                      className="text-sm text-amber-600 hover:text-amber-700 underline transition-colors"
                    >
                      Assign species
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={() => onFavoriteToggle(photo.id, !photo.isFavorite)}
              className="p-2 hover:bg-[var(--moss-50)] rounded-full transition-colors"
            >
              <svg
                className={`w-6 h-6 ${
                  photo.isFavorite ? "text-red-500 fill-current" : "text-[var(--mist-400)]"
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={photo.isFavorite ? 0 : 2}
                fill={photo.isFavorite ? "currentColor" : "none"}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {photo.species?.description && (
            <p className="text-[var(--mist-600)] text-sm mb-4">
              {photo.species.description}
            </p>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-[var(--moss-50)] rounded-xl">
              <svg className="w-4 h-4 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-[var(--mist-500)]">Uploaded:</span>
              <span className="text-[var(--forest-800)] font-medium">
                {formatDate(photo.uploadDate)}
              </span>
            </div>

            <div className="p-3 bg-[var(--mist-50)] rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--mist-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[var(--mist-500)]">Taken:</span>
                {isEditingDate ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="date"
                      value={editDateValue}
                      onChange={(e) => setEditDateValue(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-[var(--mist-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--moss-400)] focus:border-transparent"
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                    />
                    <button
                      onClick={async () => {
                        if (onDateChange && photo) {
                          setIsSavingDate(true);
                          try {
                            await onDateChange(photo.id, editDateValue || null);
                            setIsEditingDate(false);
                          } finally {
                            setIsSavingDate(false);
                          }
                        }
                      }}
                      disabled={isSavingDate}
                      className="p-1 text-[var(--moss-600)] hover:text-[var(--moss-700)] disabled:opacity-50"
                      title="Save"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsEditingDate(false)}
                      className="p-1 text-[var(--mist-400)] hover:text-[var(--mist-600)]"
                      title="Cancel"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-[var(--forest-800)] font-medium flex-1">
                      {photo.originalDateTaken ? formatDate(photo.originalDateTaken) : "Not set"}
                    </span>
                    {onDateChange && (
                      <button
                        onClick={() => {
                          setEditDateValue(
                            photo.originalDateTaken
                              ? new Date(photo.originalDateTaken).toISOString().split('T')[0]
                              : ""
                          );
                          setIsEditingDate(true);
                        }}
                        className="p-1 text-[var(--moss-500)] hover:text-[var(--moss-700)] transition-colors"
                        title="Edit date"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              {photo.dateTakenSource === "manual" && !isEditingDate && (
                <p className="text-xs text-[var(--mist-400)] mt-1 ml-6">Manually set</p>
              )}
            </div>

            {photo.notes && (
              <div className="p-3 bg-[var(--bark-50)] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[var(--bark-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[var(--bark-600)] text-xs font-medium uppercase tracking-wider">Notes</span>
                </div>
                <p className="text-[var(--forest-800)]">
                  {photo.notes}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--mist-100)]">
            <a
              href={photo.originalUrl}
              download
              target="_blank"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[var(--forest-700)] bg-white border border-[var(--mist-200)] rounded-xl hover:bg-[var(--moss-50)] hover:border-[var(--moss-300)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Original
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
