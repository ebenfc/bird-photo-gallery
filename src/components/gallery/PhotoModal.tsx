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
  onSetCoverPhoto?: (photoId: number, speciesId: number) => Promise<boolean>;
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
  onSetCoverPhoto,
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

  // Mobile UX states
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingCover, setIsSettingCover] = useState(false);
  const [coverPhotoSet, setCoverPhotoSet] = useState(false);
  const [showFullscreenUI, setShowFullscreenUI] = useState(false);
  const [fullscreenUITimer, setFullscreenUITimer] = useState<NodeJS.Timeout | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  // Reset edit state when photo changes
  useEffect(() => {
    setIsEditingDate(false);
    setEditDateValue("");
    setIsEditingNotes(false);
    setEditNotesValue("");
    setShowDeleteConfirm(false);
    setJustFavorited(false);
    setIsFullscreen(false);
    setShowFullscreenUI(false);
    setCoverPhotoSet(false);
    setShowOverflowMenu(false);
    if (fullscreenUITimer) {
      clearTimeout(fullscreenUITimer);
      setFullscreenUITimer(null);
    }
  }, [photo?.id]);

  // Clear fullscreen UI timer on unmount
  useEffect(() => {
    return () => {
      if (fullscreenUITimer) {
        clearTimeout(fullscreenUITimer);
      }
    };
  }, [fullscreenUITimer]);

  // Function to show fullscreen UI with auto-hide
  const showUITemporarily = useCallback(() => {
    setShowFullscreenUI(true);
    if (fullscreenUITimer) {
      clearTimeout(fullscreenUITimer);
    }
    const timer = setTimeout(() => {
      setShowFullscreenUI(false);
      setFullscreenUITimer(null);
    }, 3000);
    setFullscreenUITimer(timer);
  }, [fullscreenUITimer]);

  // Handle fullscreen tap to toggle UI
  const handleFullscreenTap = useCallback(() => {
    if (showFullscreenUI) {
      // UI is visible, hide it and exit fullscreen
      setShowFullscreenUI(false);
      if (fullscreenUITimer) {
        clearTimeout(fullscreenUITimer);
        setFullscreenUITimer(null);
      }
      setIsFullscreen(false);
    } else {
      // UI is hidden, show it temporarily
      showUITemporarily();
    }
  }, [showFullscreenUI, fullscreenUITimer, showUITemporarily]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft" && onNavigate && canNavigate.prev) {
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && onNavigate && canNavigate.next) {
        onNavigate("next");
      } else if (e.key === "f") {
        setIsFullscreen(prev => !prev);
      }
    },
    [onClose, onNavigate, canNavigate, isFullscreen]
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

  const handleSetCoverPhoto = async () => {
    if (!photo || !photo.species || !onSetCoverPhoto) return;
    setIsSettingCover(true);
    setCoverPhotoSet(false);
    try {
      const success = await onSetCoverPhoto(photo.id, photo.species.id);
      if (success) {
        setCoverPhotoSet(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setCoverPhotoSet(false), 3000);
      }
    } finally {
      setIsSettingCover(false);
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

  // Fullscreen mode - just the photo
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
        onClick={handleFullscreenTap}
      >
        <Image
          src={photo.originalUrl}
          alt={photo.species?.commonName || "Bird photo"}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
        {/* UI elements - only shown when showFullscreenUI is true */}
        {showFullscreenUI && (
          <>
            {/* Subtle hint to exit */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2
              bg-black/50 text-white/70 text-sm rounded-full backdrop-blur-sm
              animate-fade-in">
              Tap anywhere to exit fullscreen
            </div>
            {/* Navigation in fullscreen */}
            {onNavigate && canNavigate.prev && (
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate("prev"); showUITemporarily(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3
                  bg-black/30 backdrop-blur-sm rounded-full text-white/80
                  hover:bg-black/50 transition-all animate-fade-in"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {onNavigate && canNavigate.next && (
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate("next"); showUITemporarily(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3
                  bg-black/30 backdrop-blur-sm rounded-full text-white/80
                  hover:bg-black/50 transition-all animate-fade-in"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-[var(--forest-950)]/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content - different layout for mobile vs desktop */}
      <div className="relative flex flex-col lg:flex-row w-full h-full animate-fade-in-scale">
        {/* Image container */}
        <div
          className={`flex-1 flex items-center justify-center p-4 lg:p-8 relative transition-all duration-300
            ${!isDetailsExpanded ? "lg:flex-1" : ""}`}
          onClick={() => {
            // On mobile, tapping the image area toggles fullscreen
            if (window.innerWidth < 1024) {
              setIsFullscreen(true);
            }
          }}
        >
          {/* Top controls bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full
                text-white/80 hover:text-white hover:bg-white/20
                shadow-[var(--shadow-lg)]
                transition-all duration-[var(--timing-fast)]
                hover:scale-105 active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Fullscreen button (desktop) */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
              className="hidden lg:flex p-3 bg-white/10 backdrop-blur-md rounded-full
                text-white/80 hover:text-white hover:bg-white/20
                shadow-[var(--shadow-lg)]
                transition-all duration-[var(--timing-fast)]
                hover:scale-105 active:scale-95"
              title="Fullscreen (F)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Navigation arrows */}
          {onNavigate && canNavigate.prev && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate("prev"); }}
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
              onClick={(e) => { e.stopPropagation(); onNavigate("next"); }}
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

          {/* Tap hint for mobile */}
          <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10
            px-4 py-2 bg-black/40 text-white/70 text-xs rounded-full backdrop-blur-sm">
            Tap photo for fullscreen
          </div>

          <div className="relative w-full h-full max-w-4xl max-h-[50vh] lg:max-h-[80vh]">
            <Image
              src={photo.originalUrl}
              alt={photo.species?.commonName || "Bird photo"}
              fill
              className="object-contain cursor-pointer lg:cursor-default"
              sizes="(max-width: 1024px) 100vw, 80vw"
              priority
            />
          </div>
        </div>

        {/* Mobile: Collapsible details panel */}
        <div className={`lg:hidden bg-white rounded-t-[var(--radius-2xl)] shadow-[var(--shadow-2xl)]
          transition-all duration-300 ease-out overflow-hidden
          ${isDetailsExpanded ? "max-h-[50vh]" : "max-h-20"}`}>
          {/* Collapse/Expand handle */}
          <button
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="w-full p-4 flex items-center justify-between border-b border-[var(--border)]"
          >
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-[var(--forest-900)]">
                {photo.species?.commonName || "Species Unassigned"}
              </h2>
              <button
                onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
                className={`p-1.5 rounded-full ${justFavorited ? "animate-heart-beat" : ""}`}
              >
                <svg
                  className={`w-5 h-5 ${photo.isFavorite ? "text-red-500 fill-current" : "text-[var(--mist-300)]"}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={photo.isFavorite ? 0 : 2}
                  fill={photo.isFavorite ? "currentColor" : "none"}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Overflow menu button */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowOverflowMenu(!showOverflowMenu); }}
                  className="p-2 text-[var(--mist-400)] hover:text-[var(--forest-700)]
                    hover:bg-[var(--mist-50)] rounded-full transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                {showOverflowMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => { e.stopPropagation(); setShowOverflowMenu(false); }}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-[var(--radius-lg)]
                      shadow-[var(--shadow-lg)] border border-[var(--border)] py-1 min-w-[180px]">
                      {onChangeSpecies && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOverflowMenu(false);
                            onChangeSpecies(photo);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-[var(--forest-700)]
                            hover:bg-[var(--moss-50)] flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {photo.species ? "Change Species" : "Assign Species"}
                        </button>
                      )}
                      {photo.species && onSetCoverPhoto && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOverflowMenu(false);
                            handleSetCoverPhoto();
                          }}
                          disabled={isSettingCover}
                          className="w-full px-4 py-2.5 text-left text-sm text-[var(--forest-700)]
                            hover:bg-[var(--moss-50)] flex items-center gap-2 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {isSettingCover ? "Setting..." : coverPhotoSet ? "Cover Set!" : "Set as Cover"}
                        </button>
                      )}
                      {onDelete && (
                        <>
                          <div className="my-1 border-t border-[var(--border)]" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOverflowMenu(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600
                              hover:bg-red-50 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Photo
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-[var(--mist-400)] transition-transform duration-300
                  ${isDetailsExpanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </button>

          {/* Expandable content */}
          <div className="p-4 overflow-auto max-h-[calc(50vh-5rem)]">
            {/* Date info cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 bg-[var(--moss-50)] rounded-[var(--radius-md)]">
                <span className="text-xs text-[var(--mist-500)] uppercase">Uploaded</span>
                <p className="text-sm font-semibold text-[var(--forest-800)]">
                  {formatDate(photo.uploadDate)}
                </p>
              </div>
              <div className="p-3 bg-[var(--mist-50)] rounded-[var(--radius-md)]">
                <span className="text-xs text-[var(--mist-500)] uppercase">Taken</span>
                <p className="text-sm font-semibold text-[var(--forest-800)]">
                  {photo.originalDateTaken ? formatDate(photo.originalDateTaken) : "Not set"}
                </p>
              </div>
            </div>

            {/* Notes section */}
            {photo.notes && (
              <div className="p-3 bg-[var(--bark-50)] rounded-[var(--radius-md)]">
                <span className="text-xs text-[var(--bark-500)] uppercase font-medium">Notes</span>
                <p className="text-sm text-[var(--forest-800)] mt-1 leading-relaxed">
                  {photo.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Full sidebar */}
        <div className="hidden lg:block lg:w-[340px] bg-white lg:rounded-l-[var(--radius-2xl)] p-6 overflow-auto
          shadow-[var(--shadow-2xl)] animate-slide-in-right">
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

          {/* Set as cover photo button */}
          {photo.species && onSetCoverPhoto && (
            <button
              onClick={handleSetCoverPhoto}
              disabled={isSettingCover || coverPhotoSet}
              className={`w-full mb-4 px-4 py-2.5 text-sm font-medium
                border rounded-[var(--radius-lg)]
                hover:shadow-[var(--shadow-sm)]
                active:scale-[0.98] transition-all disabled:opacity-50
                ${coverPhotoSet
                  ? "text-[var(--moss-600)] bg-gradient-to-br from-[var(--moss-100)] to-[var(--moss-50)] border-[var(--moss-300)]"
                  : "text-[var(--forest-600)] bg-gradient-to-br from-[var(--forest-50)] to-[var(--moss-50)] border-[var(--forest-200)] hover:border-[var(--forest-300)]"}`}
            >
              {isSettingCover ? "Setting cover photo..." : coverPhotoSet ? "Cover photo set!" : "Set as species cover photo"}
            </button>
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

          {/* Delete link - subtle placement */}
          {onDelete && (
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-[var(--mist-400)] hover:text-red-500
                  transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete photo
              </button>
            </div>
          )}
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
