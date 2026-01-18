"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Species, Rarity } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

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
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    setSelectedSpeciesId("");
    setNotes("");
    setUploadProgress(0);
    setError(null);
    setShowNewSpeciesForm(false);
    setNewSpeciesName("");
    setNewScientificName("");
    setNewRarity("common");
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const processFile = useCallback((file: File) => {
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
    setStep("preview");
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

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
      onSpeciesCreated();
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
            <h2 className="text-lg font-bold text-[var(--forest-900)]">
              {step === "select" && "Upload Photo"}
              {step === "preview" && "Photo Details"}
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
                accept="image/*,.heic"
                capture="environment"
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
                <h3 className="text-lg font-bold text-[var(--forest-800)] mb-2">
                  Select a Photo
                </h3>
                <p className="text-sm text-[var(--mist-500)] mb-1">
                  Tap to choose from your photo library
                </p>
                <p className="text-xs text-[var(--mist-400)]">
                  or drag and drop here
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
          {step === "preview" && previewUrl && (
            <div className="space-y-5 animate-fade-in">
              {/* Photo Preview */}
              <div className="relative w-full aspect-[4/3] rounded-[var(--radius-xl)] overflow-hidden
                bg-gradient-to-br from-[var(--mist-50)] to-[var(--moss-50)]
                shadow-[var(--shadow-md)] ring-1 ring-[var(--border)]">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>

              {/* File info */}
              {selectedFile && (
                <p className="text-xs text-[var(--mist-500)] text-center font-medium">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}

              {/* Species Selection */}
              {!showNewSpeciesForm ? (
                <div className="space-y-2.5">
                  <label className="block text-sm font-semibold text-[var(--forest-700)]">
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
              ) : (
                /* New Species Form */
                <div className="space-y-3 p-4 bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)]
                  rounded-[var(--radius-xl)] border border-[var(--moss-200)]
                  shadow-[var(--shadow-sm)] animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--forest-700)]">New Species</span>
                    <button
                      onClick={() => setShowNewSpeciesForm(false)}
                      className="text-xs font-medium text-[var(--mist-500)] hover:text-[var(--mist-700)]
                        transition-colors"
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
                    <label className="block text-xs font-semibold text-[var(--mist-600)] mb-2">
                      Rarity
                    </label>
                    <div className="flex gap-2">
                      {(["common", "uncommon", "rare"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewRarity(r)}
                          className={`flex-1 px-3 py-2 rounded-[var(--radius-md)] border-2
                            text-xs font-semibold
                            transition-all duration-[var(--timing-fast)]
                            active:scale-95
                            ${newRarity === r
                              ? r === "common"
                                ? "bg-[var(--mist-100)] border-[var(--mist-300)] text-[var(--mist-700)]"
                                : r === "uncommon"
                                ? "bg-gradient-to-br from-[var(--amber-50)] to-[var(--amber-100)] border-[var(--amber-300)] text-[var(--amber-700)]"
                                : "bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-700"
                              : "bg-white border-[var(--mist-200)] text-[var(--mist-500)] hover:border-[var(--mist-300)]"
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
                <label className="block text-sm font-semibold text-[var(--forest-700)] mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                {/* Animated bird icon */}
                <svg className="w-10 h-10 text-[var(--forest-600)] animate-bird-hop" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.5 8.5c-.5-.5-1.5-.5-2.5 0L15 12l-3-1-4.5 2.5c-1.5 1-2 2.5-1.5 4l1 2.5 1.5-1 2-1.5 3 .5 2-1.5 4-4c1-1 1-2.5 0-3.5l-2.5-2z" />
                  <circle cx="18" cy="7" r="1.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--forest-800)] mb-5">
                Uploading your photo...
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-[var(--mist-100)] rounded-full h-3 mb-3
                shadow-[var(--shadow-inset-sm)] overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[var(--forest-500)] to-[var(--moss-500)] h-3
                    rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-[var(--mist-500)]">{uploadProgress}%</p>
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
              <h3 className="text-lg font-bold text-[var(--forest-800)] mb-2">
                Beautiful shot!
              </h3>
              <p className="text-sm text-[var(--mist-500)] mb-7">
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
          <div className="p-5 border-t border-[var(--border)] bg-[var(--mist-50)]">
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
