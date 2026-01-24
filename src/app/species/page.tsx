"use client";

import { useState, useEffect } from "react";
import { Species, SpeciesResponse, Rarity } from "@/types";
import SpeciesCard from "@/components/species/SpeciesCard";
import SpeciesForm from "@/components/species/SpeciesForm";
import Button from "@/components/ui/Button";

export default function SpeciesDirectory() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);

  const fetchSpecies = async () => {
    try {
      const res = await fetch("/api/species");
      const data: SpeciesResponse = await res.json();
      setSpecies(data.species);
    } catch (err) {
      console.error("Failed to fetch species:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecies();
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
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to create species");
    }

    // Refresh the list
    await fetchSpecies();
  };

  const handleEditSpecies = async (data: {
    commonName: string;
    scientificName?: string;
    description?: string;
    rarity?: Rarity;
  }) => {
    if (!editingSpecies) return;

    const res = await fetch(`/api/species/${editingSpecies.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update species");
    }

    // Refresh the list
    await fetchSpecies();
    setEditingSpecies(null);
  };

  const handleDeleteSpecies = async () => {
    if (!editingSpecies) return;

    const res = await fetch(`/api/species/${editingSpecies.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete species");
    }

    // Refresh the list
    await fetchSpecies();
    setEditingSpecies(null);
  };

  if (loading) {
    return (
      <div className="pnw-texture min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--forest-900)]">Species Directory</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[var(--moss-50)] to-[var(--mist-50)] rounded-2xl aspect-[4/3] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pnw-texture min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--forest-900)]">Species Directory</h1>
          <p className="text-[var(--mist-500)] mt-1">
            {species.length} species in your collection
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Species
        </Button>
      </div>

      {species.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--moss-100)] to-[var(--forest-100)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--forest-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--forest-800)] mb-2">
            No species yet
          </h3>
          <p className="text-[var(--mist-500)] mb-6 max-w-sm mx-auto">
            Start building your bird collection by adding your first species
          </p>
          <Button onClick={() => setShowForm(true)}>Add Species</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {species.map((s) => (
            <SpeciesCard
              key={s.id}
              species={s}
              onEdit={() => setEditingSpecies(s)}
            />
          ))}
        </div>
      )}

      {/* Create new species form */}
      <SpeciesForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateSpecies}
      />

      {/* Edit species form */}
      <SpeciesForm
        isOpen={!!editingSpecies}
        onClose={() => setEditingSpecies(null)}
        onSubmit={handleEditSpecies}
        onDelete={handleDeleteSpecies}
        initialData={
          editingSpecies
            ? {
                commonName: editingSpecies.commonName,
                scientificName: editingSpecies.scientificName || undefined,
                description: editingSpecies.description || undefined,
                rarity: editingSpecies.rarity,
              }
            : undefined
        }
        title="Edit Species"
        photoCount={editingSpecies?.photoCount || 0}
      />
    </div>
  );
}
