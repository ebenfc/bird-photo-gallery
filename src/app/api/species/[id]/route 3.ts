import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { species, photos, Rarity } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const VALID_RARITIES: Rarity[] = ["common", "uncommon", "rare"];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/species/[id] - Get a single species with photo count
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const speciesId = parseInt(id);

    if (isNaN(speciesId)) {
      return NextResponse.json({ error: "Invalid species ID" }, { status: 400 });
    }

    const result = await db
      .select({
        id: species.id,
        commonName: species.commonName,
        scientificName: species.scientificName,
        description: species.description,
        rarity: species.rarity,
        createdAt: species.createdAt,
        photoCount: sql<number>`count(${photos.id})`.as("photo_count"),
      })
      .from(species)
      .leftJoin(photos, eq(photos.speciesId, species.id))
      .where(eq(species.id, speciesId))
      .groupBy(species.id);

    if (result.length === 0) {
      return NextResponse.json({ error: "Species not found" }, { status: 404 });
    }

    return NextResponse.json({ species: result[0] });
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}

// PATCH /api/species/[id] - Update a species
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const speciesId = parseInt(id);

    if (isNaN(speciesId)) {
      return NextResponse.json({ error: "Invalid species ID" }, { status: 400 });
    }

    const body = await request.json();
    const { commonName, scientificName, description, rarity } = body;

    const updateData: Record<string, string | null> = {};
    if (commonName !== undefined) {
      if (!commonName || typeof commonName !== "string") {
        return NextResponse.json(
          { error: "Common name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.commonName = commonName.trim();
    }
    if (scientificName !== undefined) {
      updateData.scientificName = scientificName?.trim() || null;
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (rarity !== undefined) {
      if (!VALID_RARITIES.includes(rarity)) {
        return NextResponse.json(
          { error: "Invalid rarity value. Must be 'common', 'uncommon', or 'rare'" },
          { status: 400 }
        );
      }
      updateData.rarity = rarity;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const result = await db
      .update(species)
      .set(updateData)
      .where(eq(species.id, speciesId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Species not found" }, { status: 404 });
    }

    return NextResponse.json({ species: result[0] });
  } catch (error) {
    console.error("Error updating species:", error);
    return NextResponse.json(
      { error: "Failed to update species" },
      { status: 500 }
    );
  }
}

// DELETE /api/species/[id] - Delete a species (cascades to photos)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const speciesId = parseInt(id);

    if (isNaN(speciesId)) {
      return NextResponse.json({ error: "Invalid species ID" }, { status: 400 });
    }

    const result = await db
      .delete(species)
      .where(eq(species.id, speciesId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Species not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("Error deleting species:", error);
    return NextResponse.json(
      { error: "Failed to delete species" },
      { status: 500 }
    );
  }
}
