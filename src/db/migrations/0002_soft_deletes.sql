-- Migration: Add soft delete support
-- Adds deleted_at column to photos and species tables

-- Add deleted_at column to photos table
ALTER TABLE photos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_at column to species table
ALTER TABLE species ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add indexes for faster queries on non-deleted records
CREATE INDEX IF NOT EXISTS idx_photos_deleted_at ON photos(deleted_at);
CREATE INDEX IF NOT EXISTS idx_species_deleted_at ON species(deleted_at);
