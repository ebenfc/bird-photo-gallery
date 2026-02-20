import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ebirdLifeList, species } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, isErrorResponse } from "@/lib/authHelpers";
import { checkAndGetRateLimitResponse, RATE_LIMITS, addRateLimitHeaders } from "@/lib/rateLimit";
import { logError } from "@/lib/logger";
import { parseEbirdCsv } from "@/lib/ebirdCsvParser";
import { batchLookupSpeciesCodes } from "@/lib/ebird";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// POST /api/ebird/import — Upload and import eBird life list CSV
export async function POST(request: NextRequest) {
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.write);
  if (!rateCheck.allowed) return rateCheck.response;

  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;
  const { userId } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const csvText = await file.text();

    // Parse the CSV
    const parsed = parseEbirdCsv(csvText);

    if (parsed.species.length === 0) {
      return NextResponse.json(
        { error: parsed.parseErrors[0] || "No species found in file" },
        { status: 400 }
      );
    }

    // Look up eBird species codes for all parsed species
    const commonNames = parsed.species.map((s) => s.commonName);
    const codeMap = await batchLookupSpeciesCodes(commonNames);

    // Query existing entries to distinguish new vs updated on import
    const existingEntries = await db
      .select({ speciesCode: ebirdLifeList.speciesCode })
      .from(ebirdLifeList)
      .where(eq(ebirdLifeList.userId, userId));
    const existingCodes = new Set(existingEntries.map((e) => e.speciesCode));

    // Upsert into ebird_life_list
    let newCount = 0;
    let updatedCount = 0;
    const now = new Date();

    for (const sp of parsed.species) {
      const speciesCode = codeMap.get(sp.commonName);
      if (!speciesCode) continue; // Skip species we can't match to eBird taxonomy

      await db
        .insert(ebirdLifeList)
        .values({
          userId,
          speciesCode,
          commonName: sp.commonName,
          scientificName: sp.scientificName,
          firstObservedDate: sp.firstObservedDate,
          importedAt: now,
        })
        .onConflictDoUpdate({
          target: [ebirdLifeList.userId, ebirdLifeList.speciesCode],
          set: {
            commonName: sp.commonName,
            scientificName: sp.scientificName,
            // Keep earliest date
            firstObservedDate: sql`LEAST(${ebirdLifeList.firstObservedDate}, ${sp.firstObservedDate})`,
            importedAt: now,
          },
        });

      if (existingCodes.has(speciesCode)) {
        updatedCount++;
      } else {
        newCount++;
      }
    }

    // Backfill ebirdSpeciesCode on user's existing BirdFeed species
    const userSpecies = await db
      .select({ id: species.id, commonName: species.commonName, ebirdSpeciesCode: species.ebirdSpeciesCode })
      .from(species)
      .where(eq(species.userId, userId));

    let matched = 0;
    for (const sp of userSpecies) {
      const code = codeMap.get(sp.commonName);
      if (code && !sp.ebirdSpeciesCode) {
        await db
          .update(species)
          .set({ ebirdSpeciesCode: code })
          .where(and(eq(species.id, sp.id), eq(species.userId, userId)));
      }
      // Count species that appear in both BirdFeed and the eBird import
      if (code && parsed.species.some((p) => codeMap.get(p.commonName) === code)) {
        matched++;
      }
    }

    const imported = newCount + updatedCount;
    const result = {
      success: true,
      imported,
      newCount,
      updatedCount,
      matched,
      unmatched: imported - matched,
      errors: parsed.parseErrors.length > 0 ? parsed.parseErrors : undefined,
    };

    const response = NextResponse.json(result);
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.write);
  } catch (error) {
    logError("Error importing eBird life list", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/ebird/import",
      method: "POST",
    });
    return NextResponse.json({ error: "Failed to import eBird data" }, { status: 500 });
  }
}

// DELETE /api/ebird/import — Clear all eBird life list data for user
export async function DELETE(request: NextRequest) {
  const rateCheck = checkAndGetRateLimitResponse(request, RATE_LIMITS.write);
  if (!rateCheck.allowed) return rateCheck.response;

  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;
  const { userId } = authResult;

  try {
    await db.delete(ebirdLifeList).where(eq(ebirdLifeList.userId, userId));

    const response = NextResponse.json({ success: true });
    return addRateLimitHeaders(response, rateCheck.result, RATE_LIMITS.write);
  } catch (error) {
    logError("Error clearing eBird life list", error instanceof Error ? error : new Error(String(error)), {
      route: "/api/ebird/import",
      method: "DELETE",
    });
    return NextResponse.json({ error: "Failed to clear eBird data" }, { status: 500 });
  }
}
