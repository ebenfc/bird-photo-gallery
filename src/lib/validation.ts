import { z } from 'zod';

// Rarity enum matching the database schema
export const RarityEnum = z.enum(['common', 'uncommon', 'rare']);

// Species creation/update validation
export const SpeciesSchema = z.object({
  commonName: z.string()
    .min(1, 'Species name is required')
    .max(255, 'Species name too long')
    .transform(s => s.trim()),
  scientificName: z.string()
    .max(255, 'Scientific name too long')
    .transform(s => s.trim())
    .optional()
    .nullable(),
  description: z.string()
    .max(2000, 'Description too long')
    .transform(s => s.trim())
    .optional()
    .nullable(),
  rarity: RarityEnum.optional().default('common'),
});

// Species update validation (all fields optional)
export const SpeciesUpdateSchema = z.object({
  commonName: z.string()
    .min(1, 'Species name is required')
    .max(255, 'Species name too long')
    .transform(s => s.trim())
    .optional(),
  scientificName: z.string()
    .max(255, 'Scientific name too long')
    .transform(s => s.trim())
    .optional()
    .nullable(),
  description: z.string()
    .max(2000, 'Description too long')
    .transform(s => s.trim())
    .optional()
    .nullable(),
  rarity: RarityEnum.optional(),
  coverPhotoId: z.number().int().positive().optional().nullable(),
});

// Photo update validation
export const PhotoUpdateSchema = z.object({
  speciesId: z.number().int().positive().optional().nullable(),
  isFavorite: z.boolean().optional(),
  notes: z.string()
    .max(500, 'Notes must be 500 characters or less')
    .transform(s => s.trim())
    .optional()
    .nullable(),
  originalDateTaken: z.string()
    .datetime({ message: 'Invalid date format' })
    .refine((date) => {
      const d = new Date(date);
      const now = new Date();
      return d <= now;
    }, 'Date cannot be in the future')
    .refine((date) => {
      const d = new Date(date);
      return d.getFullYear() >= 1900;
    }, 'Date cannot be before 1900')
    .optional()
    .nullable(),
});

// Browser upload validation
export const BrowserUploadSchema = z.object({
  speciesId: z.string()
    .transform(s => parseInt(s, 10))
    .refine(n => !isNaN(n) && n > 0, 'Invalid species ID')
    .optional()
    .nullable(),
  notes: z.string()
    .max(500, 'Notes must be 500 characters or less')
    .transform(s => s.trim())
    .optional()
    .nullable(),
});

// Haikubox sync validation
export const HaikuboxSyncSchema = z.object({
  force: z.boolean().optional().default(false),
});

// Generic pagination validation - converts strings to numbers with defaults
export const PaginationSchema = z.object({
  page: z.preprocess(
    (val) => val === undefined ? '1' : val,
    z.string().transform(s => parseInt(s, 10)).refine(n => !isNaN(n) && n > 0, 'Page must be a positive integer')
  ),
  limit: z.preprocess(
    (val) => val === undefined ? '50' : val,
    z.string().transform(s => parseInt(s, 10)).refine(n => !isNaN(n) && n > 0 && n <= 100, 'Limit must be between 1 and 100')
  ),
});

// Photos list query parameters validation
export const PhotosQuerySchema = z.object({
  speciesId: z.string()
    .transform(s => parseInt(s, 10))
    .refine(n => !isNaN(n) && n > 0, 'Invalid species ID')
    .optional()
    .nullable(),
  favorites: z.enum(['true', 'false']).optional(),
  rarity: z.string()
    .refine((s) => {
      if (!s) return true;
      const rarities = s.split(',');
      return rarities.every(r => ['common', 'uncommon', 'rare'].includes(r));
    }, 'Invalid rarity filter')
    .optional(),
  sort: z.enum(['recent_upload', 'oldest_upload', 'species_alpha', 'recent_taken'])
    .optional()
    .default('recent_upload'),
  page: z.preprocess(
    (val) => val === undefined ? '1' : val,
    z.string().transform(s => parseInt(s, 10)).refine(n => !isNaN(n) && n > 0, 'Page must be a positive integer')
  ).optional(),
  limit: z.preprocess(
    (val) => val === undefined ? '50' : val,
    z.string().transform(s => parseInt(s, 10)).refine(n => !isNaN(n) && n > 0 && n <= 100, 'Limit must be between 1 and 100')
  ).optional(),
});

// Species list query parameters validation
export const SpeciesQuerySchema = z.object({
  sort: z.enum(['alpha', 'photo_count', 'recent_added', 'recent_taken'])
    .optional()
    .default('alpha'),
});

// Bird lookup validation
export const BirdLookupSchema = z.object({
  name: z.string()
    .min(2, 'Bird name must be at least 2 characters')
    .max(100, 'Bird name too long')
    .transform(s => s.trim()),
});

// ID parameter validation
export const IdParamSchema = z.object({
  id: z.string()
    .transform(s => parseInt(s, 10))
    .refine(n => !isNaN(n) && n > 0, 'Invalid ID'),
});

// Helper function to validate and return typed data
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message || 'Validation failed'
    };
  }

  return {
    success: true,
    data: result.data
  };
}

// Helper to validate URL search params
export function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: string } {
  const params: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validateRequest(schema, params);
}

// Type exports for use in API routes
export type SpeciesInput = z.infer<typeof SpeciesSchema>;
export type SpeciesUpdateInput = z.infer<typeof SpeciesUpdateSchema>;
export type PhotoUpdateInput = z.infer<typeof PhotoUpdateSchema>;
export type BrowserUploadInput = z.infer<typeof BrowserUploadSchema>;
export type HaikuboxSyncInput = z.infer<typeof HaikuboxSyncSchema>;
export type PhotosQueryInput = z.infer<typeof PhotosQuerySchema>;
export type SpeciesQueryInput = z.infer<typeof SpeciesQuerySchema>;
export type BirdLookupInput = z.infer<typeof BirdLookupSchema>;
