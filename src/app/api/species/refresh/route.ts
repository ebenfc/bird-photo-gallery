import { NextResponse } from "next/server";
import { db } from "@/db";
import { species } from "@/db/schema";
import { eq } from "drizzle-orm";
import { lookupBirdFromWikipedia } from "@/lib/wikipedia";

// POST /api/species/refresh - Refresh all species with Wikipedia data
export async function POST() {
  try {
    // Get all species
    const allSpecies = await db.select().from(species);

    const results: Array<{
      id: number;
      commonName: string;
      status: "updated" | "not_found" | "error";
      scientificName?: string | null;
      description?: string | null;
    }> = [];

    for (const s of allSpecies) {
      try {
        // Look up species from Wikipedia directly
        const data = await lookupBirdFromWikipedia(s.commonName);

        if (data) {
          // Update species with new data
          await db
            .update(species)
            .set({
              scientificName: data.scientificName || s.scientificName,
              description: data.description || s.description,
            })
            .where(eq(species.id, s.id));

          results.push({
            id: s.id,
            commonName: s.commonName,
            status: "updated",
            scientificName: data.scientificName,
            description: data.description ? data.description.substring(0, 80) + "..." : null,
          });
        } else {
          results.push({
            id: s.id,
            commonName: s.commonName,
            status: "not_found",
          });
        }

        // Small delay to avoid rate limiting Wikipedia
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Error updating ${s.commonName}:`, err);
        results.push({
          id: s.id,
          commonName: s.commonName,
          status: "error",
        });
      }
    }

    const updated = results.filter((r) => r.status === "updated").length;
    const notFound = results.filter((r) => r.status === "not_found").length;
    const errors = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `Refreshed ${updated} species, ${notFound} not found, ${errors} errors`,
      total: allSpecies.length,
      updated,
      notFound,
      errors,
      results,
    });
  } catch (error) {
    console.error("Error refreshing species:", error);
    return NextResponse.json(
      { error: "Failed to refresh species" },
      { status: 500 }
    );
  }
}
