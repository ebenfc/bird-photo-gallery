"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Species, Rarity } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RarityBadge from "@/components/ui/RarityBadge";

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

  // New species form state
  const [showNewSpeciesForm, setShowNewSpeciesForm] = useState(false);
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [newScientificName, setNewScientificName] = useState("");
  const [newRarity, setNewRarity] = useState<Rarity>("common");
  const [creatingSpecies, setCreatingSpecies] = useState(false);

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
    setNewSpeciesName("");
    setNewScientificName("");
    setNewRarity("common");
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

  const handleCreateSpecies = async () => {
    if (!newSpeciesName.trim()) {
      setError("Species name is required");
      return;
    }

    setCreatingSpecies(true);
    setError(null);

    try {
      const res = await fetch("/api/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commonName: newSpeciesName.trim(),
          scientificName: newScientificName.trim() || undefined,
          rarity: newRarity,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create species");
      }

      const { species: newSpecies } = await res.json();

      // Notify parent to refresh species list
      onSpeciesCreated();

      // Select the newly created species
      setSelectedSpeciesId(newSpecies.id.toString());
      setShowNewSpeciesForm(false);
      setNewSpeciesName("");
      setNewScientificName("");
      setNewRarity("common");
    } catch (err) {
      console.error("Failed to create species:", err);
      setError("Failed to create species. Please try again.");
    } finally {
      setCreatingSpecies(false);
    }
  };

  const uploadSingleFile = (
    file: File,
    speciesId: string,
    fileNotes: string,
    index: number
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

        return uploadSingleFile(file, fileSpeciesId, fileNotes, index);
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
    // The gallery will refresh and show the new photo
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--forest-950)]/80 to-[var(--mist-900)]/70 backdrop-blur-sm"
        onClick={step === "uploading" ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-[var(--mist-100)]">
        {/* Top accent border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--forest-600)] via-[var(--moss-500)] to-[var(--forest-600)]" />

        {/* Header */}
        <div className="p-4 border-b border-[var(--mist-100)] bg-gradient-to-r from-[var(--moss-50)] to-[var(--mist-50)]">
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
                className="p-2 text-[var(--mist-400)] hover:text-[var(--mist-600)] hover:bg-white/50 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Step: Select File */}
          {step === "select" && (
            <div className="text-center py-8">
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
                className="border-2 border-dashed border-[var(--moss-300)] rounded-2xl p-8 cursor-pointer hover:border-[var(--moss-500)] hover:bg-[var(--moss-50)] transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[var(--forest-800)] mb-2">
                  Select Photos
                </h3>
                <p className="text-sm text-[var(--mist-500)]">
                  Tap to choose from your photo library
                </p>
                <p className="text-xs text-[var(--mist-400)] mt-2">
                  Select multiple photos at once. Supports JPEG, PNG, and HEIC.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
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
                    <Image
                      src={previewUrls[0]}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
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
              {!showNewSpeciesForm ? (
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
                          updated[currentPhotoIndex] = {
                            ...updated[currentPhotoIndex],
                            speciesId: e.target.value,
                          };
                          return updated;
                        });
                      }
                    }}
                  >
                    <option value="">Select species...</option>
                    {species
                      .sort((a, b) => a.commonName.localeCompare(b.commonName))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.commonName}
                        </option>
                      ))}
                  </Select>
                  <button
                    onClick={() => setShowNewSpeciesForm(true)}
                    className="w-full flex items-center justify-center gap-2 p-2 text-sm text-[var(--forest-700)] border border-dashed border-[var(--moss-200)] rounded-xl hover:border-[var(--moss-400)] hover:bg-[var(--moss-50)] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Species
                  </button>
                </div>
              ) : (
                /* New Species Form */
                <div className="space-y-3 p-3 bg-[var(--moss-50)] rounded-xl border border-[var(--moss-200)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--forest-700)]">New Species</span>
                    <button
                      onClick={() => setShowNewSpeciesForm(false)}
                      className="text-xs text-[var(--mist-500)] hover:text-[var(--mist-700)]"
                    >
                      Cancel
                    </button>
                  </div>
                  <Input
                    placeholder="Common name (e.g., Bald Eagle)"
                    value={newSpeciesName}
                    onChange={(e) => setNewSpeciesName(e.target.value)}
                  />
                  <Input
                    placeholder="Scientific name (optional)"
                    value={newScientificName}
                    onChange={(e) => setNewScientificName(e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-medium text-[var(--mist-600)] mb-1.5">
                      Rarity
                    </label>
                    <div className="flex gap-2">
                      {(["common", "uncommon", "rare"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewRarity(r)}
                          className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            newRarity === r
                              ? r === "common"
                                ? "bg-slate-100 border-slate-300 text-slate-700"
                                : r === "uncommon"
                                ? "bg-amber-50 border-amber-300 text-amber-700"
                                : "bg-red-50 border-red-300 text-red-700"
                              : "bg-white border-[var(--mist-200)] text-[var(--mist-500)]"
                          }`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateSpecies}
                    disabled={!newSpeciesName.trim() || creatingSpecies}
                    size="sm"
                    className="w-full"
                  >
                    {creatingSpecies ? "Creating..." : "Create & Select"}
                  </Button>
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
                        updated[currentPhotoIndex] = {
                          ...updated[currentPhotoIndex],
                          notes: e.target.value,
                        };
                        return updated;
                      });
                    }
                  }}
                  placeholder="Add details about this sighting..."
                  rows={2}
                  className="block w-full px-3 py-2 border border-[var(--mist-200)] rounded-xl text-sm
                    bg-white text-[var(--foreground)] placeholder-[var(--mist-400)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--moss-400)] focus:border-[var(--moss-400)]
                    hover:border-[var(--mist-300)] transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Uploading */}
          {step === "uploading" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--forest-600)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
          <div className="p-4 border-t border-[var(--mist-100)] bg-[var(--mist-50)]">
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpload} className="flex-1">
                {selectedFiles.length === 1 ? "Upload Photo" : `Upload ${selectedFiles.length} Photos`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
