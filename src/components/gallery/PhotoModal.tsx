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
  onNotesChange?: (id: number, notes: string | null) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export default function PhotoModal({
  photo,
  onClose,
  onFavoriteToggle,
  onNavigate,
  canNavigate = { prev: false, next: false },
  onChangeSpecies,
  onDateChange,
  onNotesChange,
  onDelete,
}: PhotoModalProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDateValue, setEditDateValue] = useState("");
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesValue, setEditNotesValue] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [justFavorited, setJustFavorited] = useState(false);

  // Reset edit state when photo changes
  useEffect(() => {
    setIsEditingDate(false);
    setEditDateValue("");
    setIsEditingNotes(false);
    setEditNotesValue("");
    setShowDeleteConfirm(false);
    setJustFavorited(false);
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

  const handleFavorite = () => {
    if (!photo) return;
    const newState = !photo.isFavorite;
    onFavoriteToggle(photo.id, newState);
    if (newState) {
      setJustFavorited(true);
      setTimeout(() => setJustFavorited(false), 600);
    }
  };

  if (!photo) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-[var(--forest-950)]/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative flex flex-col lg:flex-row w-full h-full animate-fade-in-scale">
        {/* Image container */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full
              text-white/80 hover:text-white hover:bg-white/20
              shadow-[var(--shadow-lg)]
              transition-all duration-[var(--timing-fast)]
              hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {onNavigate && canNavigate.prev && (
            <button
              onClick={() => onNavigate("prev")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3.5
                bg-white/10 backdrop-blur-md rounded-full
                text-white/80 hover:text-white hover:bg-white/20
                shadow-[var(--shadow-lg)]
                transition-all duration-[var(--timing-fast)]
                hover:scale-110 hover:-translate-x-1 active:scale-95"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {onNavigate && canNavigate.next && (
            <button
              onClick={() => onNavigate("next")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3.5
                bg-white/10 backdrop-blur-md rounded-full
                text-white/80 hover:text-white hover:bg-white/20
                shadow-[var(--shadow-lg)]
                transition-all duration-[var(--timing-fast)]
                hover:scale-110 hover:translate-x-1 active:scale-95"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
        <div className="lg:w-[340px] bg-white lg:rounded-l-[var(--radius-2xl)] p-6 overflow-auto
          shadow-[var(--shadow-2xl)] animate-slide-in-right">
          {/* Close button for mobile (in sidebar) */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-2 right-2 p-2.5 text-[var(--mist-400)]
              hover:text-[var(--mist-600)] hover:bg-[var(--mist-50)]
              rounded-full transition-all duration-[var(--timing-fast)]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              {photo.species ? (
                <>
                  <h2 className="text-xl font-bold text-[var(--forest-900)] tracking-tight">
                    {photo.species.commonName}
                  </h2>
                  {photo.species.scientificName && (
                    <p className="text-[var(--mist-500)] italic text-sm">
                      {photo.species.scientificName}
                    </p>
                  )}
                  {onChangeSpecies && (
                    <button
                      onClick={() => onChangeSpecies(photo)}
                      className="text-sm text-[var(--moss-600)] hover:text-[var(--moss-700)]
                        underline underline-offset-2 mt-1.5 transition-colors"
                    >
                      Change species
                    </button>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-[var(--mist-500)] italic">
                    Species Unassigned
                  </h2>
                  {onChangeSpecies ? (
                    <button
                      onClick={() => onChangeSpecies(photo)}
                      className="text-sm text-[var(--moss-600)] hover:text-[var(--moss-700)]
                        underline underline-offset-2 transition-colors font-medium"
                    >
                      Assign species
                    </button>
                  ) : (
                    <Link
                      href="/inbox"
                      onClick={onClose}
                      className="text-sm text-[var(--moss-600)] hover:text-[var(--moss-700)]
                        underline underline-offset-2 transition-colors font-medium"
                    >
                      Assign species
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Favorite button with heartbeat animation */}
            <button
              onClick={handleFavorite}
              className={`p-2.5 rounded-full transition-all duration-[var(--timing-fast)]
                hover:bg-[var(--moss-50)] active:scale-90
                ${justFavorited ? "animate-heart-beat" : ""}`}
            >
              <svg
                className={`w-7 h-7 transition-colors duration-[var(--timing-fast)]
                  ${photo.isFavorite ? "text-red-500 fill-current" : "text-[var(--mist-300)]"}`}
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
            <p className="text-[var(--mist-600)] text-sm mb-5 leading-relaxed">
              {photo.species.description}
            </p>
          )}

          <div className="space-y-3">
            {/* Upload date card */}
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-[var(--moss-50)] to-[var(--forest-50)]
              rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)]">
              <div className="w-9 h-9 rounded-full bg-[var(--moss-100)] flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-medium text-[var(--mist-500)] uppercase tracking-wide">Uploaded</span>
                <p className="text-[var(--forest-800)] font-semibold text-sm">
                  {formatDate(photo.uploadDate)}
                </p>
              </div>
            </div>

            {/* Date taken card */}
            <div className="p-3.5 bg-[var(--mist-50)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--mist-100)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--mist-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-[var(--mist-500)] uppercase tracking-wide">Taken</span>
                  {isEditingDate ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="date"
                        value={editDateValue}
                        onChange={(e) => setEditDateValue(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-sm border-2 border-[var(--moss-300)] rounded-[var(--radius-md)]
                          focus:outline-none focus:border-[var(--moss-500)] focus:shadow-[var(--shadow-moss)]
                          transition-all"
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
                        className="p-1.5 text-[var(--moss-600)] hover:text-white hover:bg-[var(--moss-500)]
                          rounded-full transition-all disabled:opacity-50"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsEditingDate(false)}
                        className="p-1.5 text-[var(--mist-400)] hover:text-[var(--mist-600)]
                          rounded-full transition-colors"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[var(--forest-800)] font-semibold text-sm">
                      {photo.originalDateTaken ? formatDate(photo.originalDateTaken) : "Not set"}
                    </p>
                  )}
                </div>
                {onDateChange && !isEditingDate && (
                  <button
                    onClick={() => {
                      setEditDateValue(
                        photo.originalDateTaken
                          ? new Date(photo.originalDateTaken).toISOString().split('T')[0]
                          : ""
                      );
                      setIsEditingDate(true);
                    }}
                    className="p-2 text-[var(--mist-400)] hover:text-[var(--moss-600)]
                      hover:bg-[var(--moss-50)] rounded-full transition-all"
                    title="Edit date"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              {photo.dateTakenSource === "manual" && !isEditingDate && (
                <p className="text-xs text-[var(--mist-400)] mt-2 ml-12">Manually set</p>
              )}
            </div>

            {/* Notes card */}
            <div className="p-3.5 bg-gradient-to-br from-[var(--bark-50)] to-[var(--mist-50)]
              rounded-[var(--radius-lg)] shadow-[var(--shadow-xs)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--bark-100)] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[var(--bark-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-[var(--bark-600)] text-xs font-semibold uppercase tracking-wider">Notes</span>
                </div>
                {onNotesChange && !isEditingNotes && (
                  <button
                    onClick={() => {
                      setEditNotesValue(photo.notes || "");
                      setIsEditingNotes(true);
                    }}
                    className="p-1.5 text-[var(--bark-400)] hover:text-[var(--bark-600)]
                      hover:bg-[var(--bark-100)] rounded-full transition-all"
                    title="Edit notes"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              {isEditingNotes ? (
                <div className="space-y-2.5">
                  <textarea
                    value={editNotesValue}
                    onChange={(e) => setEditNotesValue(e.target.value.slice(0, 500))}
                    placeholder="Add notes about this sighting..."
                    className="w-full px-3 py-2.5 text-sm border-2 border-[var(--mist-200)]
                      rounded-[var(--radius-md)] focus:outline-none focus:border-[var(--moss-400)]
                      focus:shadow-[var(--shadow-moss)] resize-none transition-all"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--mist-400)]">{editNotesValue.length}/500</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="px-3.5 py-1.5 text-sm font-medium text-[var(--mist-500)]
                          hover:text-[var(--mist-700)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (onNotesChange && photo) {
                            setIsSavingNotes(true);
                            try {
                              await onNotesChange(photo.id, editNotesValue.trim() || null);
                              setIsEditingNotes(false);
                            } finally {
                              setIsSavingNotes(false);
                            }
                          }
                        }}
                        disabled={isSavingNotes}
                        className="px-4 py-1.5 text-sm font-semibold text-white
                          bg-gradient-to-b from-[var(--moss-500)] to-[var(--moss-600)]
                          rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]
                          hover:from-[var(--moss-400)] hover:to-[var(--moss-500)]
                          disabled:opacity-50 transition-all"
                      >
                        {isSavingNotes ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[var(--forest-800)] text-sm leading-relaxed">
                  {photo.notes || <span className="text-[var(--mist-400)] italic">No notes added</span>}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-3">
            <a
              href={photo.originalUrl}
              download
              target="_blank"
              className="flex items-center justify-center gap-2.5 w-full px-4 py-3
                text-sm font-semibold text-[var(--forest-700)]
                bg-white border-2 border-[var(--mist-200)]
                rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]
                hover:bg-[var(--moss-50)] hover:border-[var(--moss-300)] hover:shadow-[var(--shadow-md)]
                hover:-translate-y-0.5
                active:scale-[0.98] transition-all duration-[var(--timing-fast)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Original
            </a>

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2.5 w-full px-4 py-3
                  text-sm font-semibold text-red-600
                  bg-white border-2 border-red-200
                  rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]
                  hover:bg-red-50 hover:border-red-300
                  hover:-translate-y-0.5
                  active:scale-[0.98] transition-all duration-[var(--timing-fast)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-60 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-[var(--radius-2xl)] shadow-[var(--shadow-2xl)] p-6 max-w-sm w-full
            animate-fade-in-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--forest-900)]">Delete this photo?</h3>
            </div>

            <div className="mb-6 text-sm text-[var(--mist-600)]">
              <p className="mb-2">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-[var(--forest-800)]">
                <li>Photo of {photo.species?.commonName || "Unknown species"}</li>
                {photo.originalDateTaken && (
                  <li>Taken on {formatDate(photo.originalDateTaken)}</li>
                )}
              </ul>
              <p className="mt-3 font-semibold text-red-600">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 text-sm font-semibold text-[var(--forest-700)]
                  bg-white border-2 border-[var(--mist-200)]
                  rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]
                  hover:bg-[var(--mist-50)] hover:border-[var(--mist-300)]
                  active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (onDelete && photo) {
                    setIsDeleting(true);
                    try {
                      await onDelete(photo.id);
                      setShowDeleteConfirm(false);
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 text-sm font-semibold text-white
                  bg-gradient-to-b from-red-500 to-red-600
                  rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
                  hover:from-red-400 hover:to-red-500
                  disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {isDeleting ? "Deleting..." : "Delete Photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
