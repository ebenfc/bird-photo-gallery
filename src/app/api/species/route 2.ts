import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { species, photos } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

// GET /api/species - List all species with photo counts
export async function GET() {
  try {
    const result = await db
      .select({
        id: species.id,
        commonName: species.commonName,
        scientificName: species.scientificName,
        description: species.description,
        createdAt: species.createdAt,
        photoCount: sql<number>`count(${photos.id})`.as("photo_count"),
      })
      .from(species)
      .leftJoin(photos, eq(photos.speciesId, species.id))
      .groupBy(species.id)
      .orderBy(species.commonName);

    // Get latest photo thumbnail for each species
    const speciesWithThumbnails = await Promise.all(
      result.map(async (s) => {
        const latestPhoto = await db
          .select({
            id: photos.id,
            thumbnailFilename: photos.thumbnailFilename,
          })
          .from(photos)
          .where(eq(photos.speciesId, s.id))
          .orderBy(desc(photos.uploadDate))
          .limit(1);

        return {
          ...s,
          latestPhoto: latestPhoto[0] || null,
        };
      })
    );

    return NextResponse.json({ species: speciesWithThumbnails });
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}

// POST /api/species - Create a new species
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commonName, scientificName, description } = body;

    if (!commonName || typeof commonName !== "string") {
      return NextResponse.json(
        { error: "Common name is required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(species)
      .values({
        commonName: commonName.trim(),
        scientificName: scientificName?.trim() || null,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json({ species: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating species:", error);
    return NextResponse.json(
      { error: "Failed to create species" },
      { status: 500 }
    );
  }
}
