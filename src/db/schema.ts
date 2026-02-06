import { pgTable, text, integer, boolean, serial, timestamp, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Rarity type for species
export type Rarity = "common" | "uncommon" | "rare";

// Users Table - Synced from Clerk
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  // Public gallery sharing fields
  username: text("username").unique(), // URL-safe username for public profile (e.g., /u/eben)
  isPublicGalleryEnabled: boolean("is_public_gallery_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// User Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Bird Species Table
export const species = pgTable("species", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  commonName: text("common_name").notNull(),
  scientificName: text("scientific_name"),
  description: text("description"),
  rarity: text("rarity").notNull().default("common"), // 'common', 'uncommon', 'rare'
  coverPhotoId: integer("cover_photo_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // Note: deletedAt column for soft deletes requires migration - uncomment after running db:push
  // deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Photos Table
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  // Note: deletedAt column for soft deletes requires migration - uncomment after running db:push
  // deletedAt: timestamp("deleted_at", { withTimezone: true }),
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
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
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

// Haikubox Activity Log Table - Stores individual detection timestamps for activity timeline
export const haikuboxActivityLog = pgTable("haikubox_activity_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  speciesCommonName: text("species_common_name").notNull(),
  speciesId: integer("species_id").references(() => species.id, {
    onDelete: "set null",
  }),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
  hourOfDay: integer("hour_of_day").notNull(), // 0-23
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 6=Saturday
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  uniqueDetection: unique().on(table.speciesCommonName, table.detectedAt),
  speciesHourIdx: index("activity_species_hour_idx").on(table.speciesCommonName, table.hourOfDay),
  detectedAtIdx: index("activity_detected_at_idx").on(table.detectedAt),
}));

// Haikubox Activity Log Relations
export const haikuboxActivityLogRelations = relations(haikuboxActivityLog, ({ one }) => ({
  species: one(species, {
    fields: [haikuboxActivityLog.speciesId],
    references: [species.id],
  }),
}));

// Activity Log Type exports
export type HaikuboxActivityLog = typeof haikuboxActivityLog.$inferSelect;
export type NewHaikuboxActivityLog = typeof haikuboxActivityLog.$inferInsert;

// App Settings Table - Stores per-user application settings
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => ({
  userKeyUnique: unique().on(table.userId, table.key),
}));

// App Settings Type exports
export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

// Current agreement version - bump this number when the agreement text changes
// to require all users to re-accept
export const CURRENT_AGREEMENT_VERSION = 1;

// User Agreements Table - Tracks when users accepted which version of the agreement
export const userAgreements = pgTable("user_agreements", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  agreementVersion: integer("agreement_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  userVersionUnique: unique().on(table.userId, table.agreementVersion),
  userIdIdx: index("user_agreements_user_id_idx").on(table.userId),
}));

// User Agreements Relations
export const userAgreementsRelations = relations(userAgreements, ({ one }) => ({
  user: one(users, {
    fields: [userAgreements.userId],
    references: [users.id],
  }),
}));

// User Agreement Type exports
export type UserAgreement = typeof userAgreements.$inferSelect;
export type NewUserAgreement = typeof userAgreements.$inferInsert;
