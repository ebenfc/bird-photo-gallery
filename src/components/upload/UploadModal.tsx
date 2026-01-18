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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifDate, setExifDate] = useState<string | null>(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotoId, setUploadedPhotoId] = useState<number | null>(null);

  // New species form state
  const [showNewSpeciesForm, setShowNewSpeciesForm] = useState(false);
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [newScientificName, setNewScientificName] = useState("");
  const [newRarity, setNewRarity] = useState<Rarity>("common");
  const [creatingSpecies, setCreatingSpecies] = useState(false);

  const resetModal = useCallback(() => {
    setStep("select");
    setSelectedFile(null);
    setPreviewUrl(null);
    setExifDate(null);
    setSelectedSpeciesId("");
    setNotes("");
    setUploadProgress(0);
    setError(null);
    setUploadedPhotoId(null);
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

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/heic", "image/heif", "image/png"];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.toLowerCase().endsWith(".heic")) {
      setError("Please select an image file (JPEG, PNG, or HEIC)");
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError("Image must be less than 20MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Try to extract EXIF date (basic approach - server does the real extraction)
    // For HEIC files, we can't easily extract on client, server will handle it
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      try {
        // We'll rely on server-side EXIF extraction
        // Client preview is just visual
      } catch {
        // Ignore EXIF extraction errors
      }
    }

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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStep("uploading");
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("photo", selectedFile);
    if (selectedSpeciesId) {
      formData.append("speciesId", selectedSpeciesId);
    }
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }

    try {
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            setUploadedPhotoId(result.photoId);
            setStep("success");
            resolve();
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error. Please check your connection."));
        });

        xhr.open("POST", "/api/upload/browser");
        xhr.send(formData);
      });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
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
              {step === "select" && "Upload Photo"}
              {step === "preview" && "Photo Details"}
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
                accept="image/*,.heic"
                capture="environment"
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
                  Select a Photo
                </h3>
                <p className="text-sm text-[var(--mist-500)]">
                  Tap to choose from your photo library
                </p>
                <p className="text-xs text-[var(--mist-400)] mt-2">
                  Supports JPEG, PNG, and HEIC
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
          {step === "preview" && previewUrl && (
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--mist-50)]">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>

              {/* File info */}
              {selectedFile && (
                <p className="text-xs text-[var(--mist-500)] text-center">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}

              {/* Species Selection */}
              {!showNewSpeciesForm ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--forest-700)]">
                    Species (optional)
                  </label>
                  <Select
                    value={selectedSpeciesId}
                    onChange={(e) => setSelectedSpeciesId(e.target.value)}
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
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                Uploading photo...
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-[var(--mist-100)] rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-[var(--forest-500)] to-[var(--moss-500)] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-[var(--mist-500)]">{uploadProgress}%</p>
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
                Photo uploaded successfully!
              </h3>
              <p className="text-sm text-[var(--mist-500)] mb-6">
                {selectedSpeciesId
                  ? "Your photo has been added to the gallery."
                  : "You can assign a species later from the gallery."}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={handleUploadAnother}>
                  Upload Another
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
                Upload Photo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
