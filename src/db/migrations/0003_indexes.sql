-- Migration: Add performance indexes
-- Strategic indexes for common query patterns

-- Photos table indexes
-- Index for filtering by species (common join condition)
CREATE INDEX IF NOT EXISTS idx_photos_species_id ON photos(species_id);

-- Index for date sorting (common sort order)
CREATE INDEX IF NOT EXISTS idx_photos_upload_date ON photos(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_photos_original_date_taken ON photos(original_date_taken DESC NULLS LAST);

-- Index for favorites filter
CREATE INDEX IF NOT EXISTS idx_photos_is_favorite ON photos(is_favorite) WHERE is_favorite = true;

-- Composite index for common species + date queries
CREATE INDEX IF NOT EXISTS idx_photos_species_date ON photos(species_id, original_date_taken DESC NULLS LAST);

-- Species table indexes
-- Index for alphabetical sorting by name
CREATE INDEX IF NOT EXISTS idx_species_common_name ON species(common_name);

-- Index for rarity filter
CREATE INDEX IF NOT EXISTS idx_species_rarity ON species(rarity);

-- Index for creation date sorting
CREATE INDEX IF NOT EXISTS idx_species_created_at ON species(created_at DESC);

-- Haikubox detections indexes
-- Index for species name lookups
CREATE INDEX IF NOT EXISTS idx_haikubox_species_name ON haikubox_detections(species_common_name);

-- Index for year filtering
CREATE INDEX IF NOT EXISTS idx_haikubox_data_year ON haikubox_detections(data_year);

-- Composite index for species + year queries
CREATE INDEX IF NOT EXISTS idx_haikubox_species_year ON haikubox_detections(species_id, data_year);

-- Index for recent sync queries
CREATE INDEX IF NOT EXISTS idx_haikubox_synced_at ON haikubox_detections(synced_at DESC);

-- Haikubox sync log indexes
-- Index for finding recent sync logs by type
CREATE INDEX IF NOT EXISTS idx_sync_log_type_date ON haikubox_sync_log(sync_type, synced_at DESC);
