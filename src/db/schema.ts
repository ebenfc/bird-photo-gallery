import { pgTable, text, integer, boolean, serial, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Rarity type for species
export type Rarity = "common" | "uncommon" | "rare";

// Bird Species Table
export const species = pgTable("species", {
  id: serial("id").primaryKey(),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name"),
  description: text("description"),
  rarity: text("rarity").notNull().default("common"), // 'common', 'uncommon', 'rare'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Photos Table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  speciesId: integer("species_id").references(() => species.id, {
    onDelete: "cascade",
  }),
  filename: text("filename").notNull(),
  thumbnailFilename: text("thumbnail_filename").notNull(),
  uploadDate: timestamp("upload_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  originalDateTaken: timestamp("original_date_taken", { withTimezone: true }),
  dateTakenSource: text("date_taken_source").notNull().default("exif"), // 'exif' or 'manual'
  isFavorite: boolean("is_favorite").notNull().default(false),
  notes: text("notes"),
});

// Relations
export const speciesRelations = relations(species, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  species: one(species, {
    fields: [photos.speciesId],
    references: [species.id],
  }),
}));

// Type exports
export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
