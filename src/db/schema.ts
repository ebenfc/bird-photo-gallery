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
  coverPhotoId: integer("cover_photo_id"),
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

// Haikubox Detections Table - Stores synced bird detection data from Haikubox
export const haikuboxDetections = pgTable("haikubox_detections", {
  id: serial("id").primaryKey(),
  speciesCommonName: text("species_common_name").notNull(),
  speciesId: integer("species_id").references(() => species.id, {
    onDelete: "set null",
  }),
  yearlyCount: integer("yearly_count").notNull().default(0),
  lastHeardAt: timestamp("last_heard_at", { withTimezone: true }),
  dataYear: integer("data_year").notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Haikubox Sync Log Table - Tracks sync history for monitoring
export const haikuboxSyncLog = pgTable("haikubox_sync_log", {
  id: serial("id").primaryKey(),
  syncType: text("sync_type").notNull(), // 'yearly' | 'daily' | 'recent'
  status: text("status").notNull(), // 'success' | 'error'
  recordsProcessed: integer("records_processed").default(0),
  errorMessage: text("error_message"),
  syncedAt: timestamp("synced_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Haikubox Relations
export const haikuboxDetectionsRelations = relations(haikuboxDetections, ({ one }) => ({
  species: one(species, {
    fields: [haikuboxDetections.speciesId],
    references: [species.id],
  }),
}));

// Type exports
export type Species = typeof species.$inferSelect;
export type NewSpecies = typeof species.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type HaikuboxDetection = typeof haikuboxDetections.$inferSelect;
export type NewHaikuboxDetection = typeof haikuboxDetections.$inferInsert;
export type HaikuboxSyncLog = typeof haikuboxSyncLog.$inferSelect;
export type NewHaikuboxSyncLog = typeof haikuboxSyncLog.$inferInsert;
