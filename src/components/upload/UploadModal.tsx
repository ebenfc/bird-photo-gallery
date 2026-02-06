"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Species, Rarity, Photo, PhotosResponse } from "@/types";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import SpeciesForm from "@/components/species/SpeciesForm";
import SwapPicker from "@/components/species/SwapPicker";
import { SPECIES_PHOTO_LIMIT } from "@/config/limits";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  species: Species[];
  onUploadComplete: () => void;
  onSpeciesCreated: () => void;
}

type UploadStep = "select" | "preview" | "uploading" | "success";

export default function UploadModal({
  isOpen,
  onClose,
  species,
  onUploadComplete,
  onSpeciesCreated,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>("select");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotoIds, setUploadedPhotoIds] = useState<number[]>([]);

  // Batch upload mode state
  const [sameSpeciesForAll, setSameSpeciesForAll] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [individualPhotoData, setIndividualPhotoData] = useState<{ speciesId: string; notes: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Swap picker state (for curated species)
  const [speciesPhotos, setSpeciesPhotos] = useState<Photo[]>([]);
  const [replacePhotoId, setReplacePhotoId] = useState<number | null>(null);
  const [loadingSpeciesPhotos, setLoadingSpeciesPhotos] = useState(false);

  // New species form state
  const [showNewSpeciesForm, setShowNewSpeciesForm] = useState(false);

  const resetModal = useCallback(() => {
    setStep("select");
    setSelectedFiles([]);
    setPreviewUrls([]);
    setSelectedSpeciesId("");
    setNotes("");
    setUploadProgress({});
    setError(null);
    setUploadedPhotoIds([]);
    setSameSpeciesForAll(true);
    setCurrentPhotoIndex(0);
    setIndividualPhotoData([]);
    setShowNewSpeciesForm(false);
    setIsDragging(false);
    setSpeciesPhotos([]);
    setReplacePhotoId(null);
    setLoadingSpeciesPhotos(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate each file
    const validTypes = ["image/jpeg", "image/jpg", "image/heic", "image/heif", "image/png"];
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!validTypes.includes(file.type.toLowerCase()) && !file.name.toLowerCase().endsWith(".heic")) {
        errors.push(`${file.name} is not a supported image file`);
        continue;
      }
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 20MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setError(errors.join(". "));
      return;
    }

    // Show warning if some files were invalid
    if (errors.length > 0) {
      console.warn("Some files were skipped:", errors);
    }

    setError(null);
    setSelectedFiles(validFiles);

    // Generate previews for all files
    try {
      const previews = await Promise.all(validFiles.map(generatePreview));
      setPreviewUrls(previews);
    } catch {
      setError("Failed to generate previews");
      return;
    }

    // Initialize individual photo data
    setIndividualPhotoData(validFiles.map(() => ({ speciesId: "", notes: "" })));
    setCurrentPhotoIndex(0);

    setStep("preview");
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Create a synthetic event-like object for handleFileSelect
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        files.forEach(f => dataTransfer.items.add(f));
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, []);

  const handleCreateSpecies = async (data: {
    commonName: string;
    scientificName?: string;
    description?: string;
    rarity?: Rarity;
  }) => {
    const res = await fetch("/api/species", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commonName: data.commonName,
        scientificName: data.scientificName,
        description: data.description,
        rarity: data.rarity || "common",
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to create species");
    }

    const { species: newSpecies } = await res.json();
    onSpeciesCreated();
    setSelectedSpeciesId(newSpecies.id.toString());
    // SpeciesForm calls onClose() after onSubmit resolves, which closes the form
  };

  // --- Curated species logic ---
  const activeSpeciesId = sameSpeciesForAll
    ? selectedSpeciesId
    : (individualPhotoData[currentPhotoIndex]?.speciesId || "");
  const activeSpecies = activeSpeciesId
    ? species.find((s) => s.id === parseInt(activeSpeciesId))
    : null;
  const isSpeciesAtLimit =
    activeSpecies && (activeSpecies.photoCount || 0) >= SPECIES_PHOTO_LIMIT;

  // Batch limit message: when "same for all" and species can't fit all photos
  const batchLimitMessage = (() => {
    if (!sameSpeciesForAll || selectedFiles.length <= 1 || !activeSpecies) return null;
    const count = activeSpecies.photoCount || 0;
    const room = SPECIES_PHOTO_LIMIT - count;
    if (room >= selectedFiles.length) return null;
    if (room <= 0) {
      return `Your ${activeSpecies.commonName} gallery is curated to ${SPECIES_PHOTO_LIMIT} photos. Switch to "Assign individually" to swap photos one at a time.`;
    }
    return `Your ${activeSpecies.commonName} gallery has room for ${room} more photo${room !== 1 ? "s" : ""}. Switch to "Assign individually" to choose which photos go here.`;
  })();

  // Fetch photos for the selected species when it's at the limit
  useEffect(() => {
    if (!isSpeciesAtLimit || !activeSpeciesId) return;

    let cancelled = false;

    const fetchPhotos = async () => {
      setLoadingSpeciesPhotos(true);
      try {
        const res = await fetch(`/api/photos?speciesId=${activeSpeciesId}&limit=${SPECIES_PHOTO_LIMIT}`);
        const data: PhotosResponse = await res.json();
        if (!cancelled) {
          setSpeciesPhotos(data.photos);
          setReplacePhotoId(null);
        }
      } catch (err) {
        console.error("Failed to fetch species photos:", err);
      } finally {
        if (!cancelled) setLoadingSpeciesPhotos(false);
      }
    };

    fetchPhotos();

    return () => {
      cancelled = true;
      setSpeciesPhotos([]);
      setReplacePhotoId(null);
    };
  }, [activeSpeciesId, isSpeciesAtLimit]);

  const uploadSingleFile = (
    file: File,
    speciesId: string,
    fileNotes: string,
    index: number,
    fileReplacePhotoId?: number | null
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("photo", file);
      if (speciesId) {
        formData.append("speciesId", speciesId);
      }
      if (fileNotes.trim()) {
        formData.append("notes", fileNotes.trim());
      }
      if (fileReplacePhotoId) {
        formData.append("replacePhotoId", fileReplacePhotoId.toString());
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [index]: percentComplete }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setUploadProgress((prev) => ({ ...prev, [index]: 100 }));
          resolve(result.photoId);
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || `Upload failed for ${file.name}`));
          } catch {
            reject(new Error(`Upload failed for ${file.name}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error(`Network error uploading ${file.name}`));
      });

      xhr.open("POST", "/api/upload/browser");
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setStep("uploading");
    setUploadProgress({});
    setError(null);

    // Initialize progress for all files
    const initialProgress: { [key: number]: number } = {};
    selectedFiles.forEach((_, index) => {
      initialProgress[index] = 0;
    });
    setUploadProgress(initialProgress);

    try {
      const uploadPromises = selectedFiles.map((file, index) => {
        let fileSpeciesId = selectedSpeciesId;
        let fileNotes = notes;

        // Use individual data if not using same species for all
        if (!sameSpeciesForAll && individualPhotoData[index]) {
          fileSpeciesId = individualPhotoData[index].speciesId;
          fileNotes = individualPhotoData[index].notes;
        }

        // Pass replacePhotoId for single upload or same-for-all mode
        const fileReplaceId = sameSpeciesForAll ? replacePhotoId : null;
        return uploadSingleFile(file, fileSpeciesId, fileNotes, index, fileReplaceId);
      });

      const photoIds = await Promise.all(uploadPromises);
      setUploadedPhotoIds(photoIds);
      setStep("success");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Some uploads failed. Please try again.");
      setStep("preview");
    }
  };

  const handleUploadAnother = () => {
    resetModal();
    onUploadComplete();
  };

  const handleViewPhoto = () => {
    onUploadComplete();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--forest-950)]/85 to-[var(--mist-900)]/75 backdrop-blur-md"
        onClick={step === "uploading" ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[var(--radius-2xl)] shadow-[var(--shadow-2xl)] w-full max-w-lg max-h-[90vh]
        overflow-hidden flex flex-col border border-[var(--mist-100)]
        animate-fade-in-scale">
        {/* Top accent border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--forest-500)] via-[var(--moss-400)] to-[var(--forest-500)]
          rounded-t-[var(--radius-2xl)]" />

        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--moss-50)] to-[var(--mist-50)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--forest-900)]">
              {step === "select" && "Upload Photos"}
              {step === "preview" && (selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Photos` : "Photo Details")}
              {step === "uploading" && "Uploading..."}
              {step === "success" && "Upload Complete"}
            </h2>
            {step !== "uploading" && (
              <button
                onClick={handleClose}
                className="p-2.5 text-[var(--mist-400)] hover:text-[var(--mist-600)]
                  hover:bg-white/70 rounded-[var(--radius-lg)]
                  transition-all duration-[var(--timing-fast)]
                  active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {/* Step: Select File */}
          {step === "select" && (
            <div className="text-center py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[var(--radius-xl)] p-10 cursor-pointer
                  transition-all duration-[var(--timing-fast)]
                  ${isDragging
                    ? "border-[var(--moss-500)] bg-[var(--moss-50)] scale-[1.02]"
                    : "border-[var(--moss-300)] hover:border-[var(--moss-500)] hover:bg-[var(--moss-50)]"
                  }`}
              >
                <div className={`w-20 h-20 mx-auto mb-5 rounded-full
                  bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)]
                  flex items-center justify-center
                  shadow-[var(--shadow-sm)]
                  transition-transform duration-[var(--timing-fast)]
                  ${isDragging ? "scale-110 animate-gentle-bounce" : ""}`}>
                  <svg className="w-10 h-10 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[var(--forest-800)] mb-2">
                  Select Photos
                </h3>
                <p className="text-sm text-[var(--mist-500)] mb-1">
                  Tap to choose from your photo library
                </p>
                <p className="text-xs text-[var(--mist-400)] mt-2">
                  Select multiple photos at once. Supports JPEG, PNG, and HEIC.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--mist-400)]">
                  <span className="px-2 py-1 bg-[var(--mist-100)] rounded-full">JPEG</span>
                  <span className="px-2 py-1 bg-[var(--mist-100)] rounded-full">PNG</span>
                  <span className="px-2 py-1 bg-[var(--mist-100)] rounded-full">HEIC</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-[var(--radius-lg)]
                  animate-fade-in">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Preview & Form */}
          {step === "preview" && previewUrls.length > 0 && (
            <div className="space-y-4">
              {/* Photo Thumbnails - Multiple Photos */}
              {selectedFiles.length > 1 ? (
                <div className="space-y-3">
                  {/* Thumbnail strip */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {previewUrls.map((url, index) => (
                      <div
                        key={index}
                        onClick={() => !sameSpeciesForAll && setCurrentPhotoIndex(index)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          !sameSpeciesForAll && currentPhotoIndex === index
                            ? "ring-2 ring-[var(--forest-500)] ring-offset-2"
                            : "hover:opacity-80"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--mist-500)] text-center">
                    {selectedFiles.length} photos selected (
                    {(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(1)} MB total)
                  </p>
                </div>
              ) : (
                /* Single Photo Preview */
                <>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--mist-50)]">
                    {previewUrls[0] && (
                      <Image
                        src={previewUrls[0]}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>
                  {selectedFiles[0] && (
                    <p className="text-xs text-[var(--mist-500)] text-center">
                      {selectedFiles[0].name} ({(selectedFiles[0].size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </>
              )}

              {/* Assignment Mode Toggle - Only for multiple photos */}
              {selectedFiles.length > 1 && (
                <div className="flex gap-2 p-1 bg-[var(--mist-50)] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSameSpeciesForAll(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      sameSpeciesForAll
                        ? "bg-white text-[var(--forest-700)] shadow-sm"
                        : "text-[var(--mist-500)] hover:text-[var(--mist-700)]"
                    }`}
                  >
                    Same for all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSameSpeciesForAll(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      !sameSpeciesForAll
                        ? "bg-white text-[var(--forest-700)] shadow-sm"
                        : "text-[var(--mist-500)] hover:text-[var(--mist-700)]"
                    }`}
                  >
                    Assign individually
                  </button>
                </div>
              )}

              {/* Individual Photo Navigation */}
              {selectedFiles.length > 1 && !sameSpeciesForAll && (
                <div className="flex items-center justify-between p-3 bg-[var(--moss-50)] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCurrentPhotoIndex((i) => Math.max(0, i - 1))}
                    disabled={currentPhotoIndex === 0}
                    className="p-1 text-[var(--forest-600)] disabled:text-[var(--mist-300)] hover:bg-white/50 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-[var(--forest-700)]">
                    Photo {currentPhotoIndex + 1} of {selectedFiles.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPhotoIndex((i) => Math.min(selectedFiles.length - 1, i + 1))}
                    disabled={currentPhotoIndex === selectedFiles.length - 1}
                    className="p-1 text-[var(--forest-600)] disabled:text-[var(--mist-300)] hover:bg-white/50 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Species Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--forest-700)]">
                  Species {selectedFiles.length > 1 && sameSpeciesForAll ? "(applies to all)" : ""} (optional)
                </label>
                <Select
                  value={sameSpeciesForAll ? selectedSpeciesId : (individualPhotoData[currentPhotoIndex]?.speciesId || "")}
                  onChange={(e) => {
                    if (sameSpeciesForAll) {
                      setSelectedSpeciesId(e.target.value);
                    } else {
                      setIndividualPhotoData((prev) => {
                        const updated = [...prev];
                        const existing = updated[currentPhotoIndex] ?? { speciesId: "", notes: "" };
                        updated[currentPhotoIndex] = {
                          ...existing,
                          speciesId: e.target.value,
                          notes: updated[currentPhotoIndex]?.notes ?? "",
                        };
                        return updated;
                      });
                    }
                  }}
                >
                  <option value="">Select species...</option>
                  {species
                    .sort((a, b) => a.commonName.localeCompare(b.commonName))
                    .map((s) => {
                      const count = s.photoCount || 0;
                      const label = count >= SPECIES_PHOTO_LIMIT
                        ? `${s.commonName} (Curated)`
                        : `${s.commonName} (${count} of ${SPECIES_PHOTO_LIMIT})`;
                      return (
                        <option key={s.id} value={s.id}>
                          {label}
                        </option>
                      );
                    })}
                </Select>
                <button
                  onClick={() => setShowNewSpeciesForm(true)}
                  className="w-full flex items-center justify-center gap-2 p-3
                    text-sm font-semibold text-[var(--forest-700)]
                    border-2 border-dashed border-[var(--moss-200)]
                    rounded-[var(--radius-lg)]
                    hover:border-[var(--moss-400)] hover:bg-[var(--moss-50)]
                    transition-all duration-[var(--timing-fast)]
                    active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Species
                </button>
              </div>

              {/* New Species Form (opens as modal on top) */}
              <SpeciesForm
                isOpen={showNewSpeciesForm}
                onClose={() => setShowNewSpeciesForm(false)}
                onSubmit={handleCreateSpecies}
                title="New Species"
              />

              {/* Batch limit message */}
              {batchLimitMessage && (
                <div className="p-4 bg-[var(--moss-50)] border border-[var(--moss-200)] rounded-xl animate-fade-in">
                  <p className="text-sm text-[var(--forest-600)]">{batchLimitMessage}</p>
                </div>
              )}

              {/* Swap picker for curated species (single photo or same-for-all with 1 photo) */}
              {isSpeciesAtLimit && !batchLimitMessage && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-4 bg-[var(--moss-50)] border border-[var(--moss-200)] rounded-xl">
                    <h3 className="font-semibold text-[var(--forest-800)] mb-1">
                      Upgrade your gallery
                    </h3>
                    <p className="text-sm text-[var(--forest-600)]">
                      Your {activeSpecies?.commonName} gallery is curated to {SPECIES_PHOTO_LIMIT} photos.
                      Choose one to replace with this new shot.
                    </p>
                  </div>
                  {loadingSpeciesPhotos ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-[var(--moss-300)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <SwapPicker
                      photos={speciesPhotos}
                      selectedPhotoId={replacePhotoId}
                      onSelect={setReplacePhotoId}
                    />
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--forest-700)] mb-1.5">
                  Notes {selectedFiles.length > 1 && sameSpeciesForAll ? "(applies to all)" : ""} (optional)
                </label>
                <textarea
                  value={sameSpeciesForAll ? notes : (individualPhotoData[currentPhotoIndex]?.notes || "")}
                  onChange={(e) => {
                    if (sameSpeciesForAll) {
                      setNotes(e.target.value);
                    } else {
                      setIndividualPhotoData((prev) => {
                        const updated = [...prev];
                        const existing = updated[currentPhotoIndex] ?? { speciesId: "", notes: "" };
                        updated[currentPhotoIndex] = {
                          ...existing,
                          notes: e.target.value,
                        };
                        return updated;
                      });
                    }
                  }}
                  placeholder="Add details about this sighting..."
                  rows={2}
                  className="block w-full px-4 py-3 border-2 border-[var(--mist-200)]
                    rounded-[var(--radius-lg)] text-sm
                    bg-white text-[var(--foreground)] placeholder-[var(--mist-400)]
                    shadow-[var(--shadow-inset-sm)]
                    focus:outline-none focus:border-[var(--moss-400)]
                    focus:shadow-[var(--shadow-moss),var(--shadow-inset-sm)]
                    hover:border-[var(--mist-300)]
                    transition-all duration-[var(--timing-fast)] resize-none"
                />
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-[var(--radius-lg)]
                  animate-fade-in">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Uploading */}
          {step === "uploading" && (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full
                bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)]
                flex items-center justify-center
                shadow-[var(--shadow-sm)]">
                {/* Generic bird silhouette */}
                <svg className="w-10 h-10 text-[var(--forest-600)] animate-bird-hop" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C10.5 3 9 4 8.5 5.5C8 7 8 8.5 8.5 10C7 10.5 5.5 11 4 11C3 11 2 11.5 2 12.5C2 13 2.5 13.5 3 13.5C4 13.5 5 13 6 12.5C7 14.5 8.5 16 10.5 17C10 17.5 9 18 8.5 19C8 19.5 8 20 8.5 20.5C9 21 9.5 21 10 20.5C11 19.5 12 18.5 13 18C14 18.5 15 19 15.5 19C14.5 17.5 14 16.5 14 15.5C16 14 18 12 19 9.5C19.5 8 20 6.5 19.5 5C19 3.5 17.5 2.5 16 3C14.5 3.5 13.5 4.5 13 6C12.5 5 12.5 4 12 3Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--forest-800)] mb-4">
                Uploading {selectedFiles.length === 1 ? "photo" : `${selectedFiles.length} photos`}...
              </h3>

              {/* Progress bars for each file */}
              <div className="space-y-3">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[index] || 0;
                  const isComplete = progress === 100;
                  return (
                    <div key={index} className="text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--mist-600)] truncate max-w-[70%]">
                          {selectedFiles.length > 1 ? `Photo ${index + 1}` : file.name}
                        </span>
                        <span className="text-xs text-[var(--mist-500)] flex items-center gap-1">
                          {progress}%
                          {isComplete && (
                            <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-[var(--mist-100)] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isComplete
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-[var(--forest-500)] to-[var(--moss-500)]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall progress for batch */}
              {selectedFiles.length > 1 && (
                <p className="text-sm text-[var(--mist-500)] mt-4">
                  {Object.values(uploadProgress).filter(p => p === 100).length} of {selectedFiles.length} complete
                </p>
              )}
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full
                bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)]
                flex items-center justify-center
                shadow-[var(--shadow-moss)]
                animate-fade-in-scale">
                <svg className="w-10 h-10 text-[var(--moss-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--forest-800)] mb-2">
                {uploadedPhotoIds.length === 1
                  ? "Photo uploaded successfully!"
                  : `${uploadedPhotoIds.length} photos uploaded successfully!`}
              </h3>
              <p className="text-sm text-[var(--mist-500)] mb-6">
                {uploadedPhotoIds.length === 1
                  ? selectedSpeciesId
                    ? "Your photo has been added to the gallery."
                    : "You can assign a species later from the gallery."
                  : sameSpeciesForAll && selectedSpeciesId
                    ? "Your photos have been added to the gallery."
                    : "You can assign species later from the gallery."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={handleUploadAnother}>
                  Upload More
                </Button>
                <Button onClick={handleViewPhoto}>
                  View Gallery
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "preview" && (
          <div className="p-5 border-t border-[var(--border)] bg-[var(--mist-50)]">
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                className="flex-1"
                disabled={!!(isSpeciesAtLimit && !replacePhotoId) || !!batchLimitMessage}
              >
                {isSpeciesAtLimit && replacePhotoId
                  ? "Swap & Upload"
                  : selectedFiles.length === 1
                    ? "Upload Photo"
                    : `Upload ${selectedFiles.length} Photos`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
