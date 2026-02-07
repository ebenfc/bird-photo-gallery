/**
 * Centralized application configuration
 * All environment variables should be accessed through this module
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || defaultValue!;
}

function getEnvVarAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvVarAsBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getOptionalEnvVar(key: string): string | undefined {
  return process.env[key];
}

export const config = {
  // Environment
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  database: {
    url: getEnvVar('DATABASE_URL', ''),
  },

  // Supabase Storage
  supabase: {
    url: getOptionalEnvVar('SUPABASE_URL'),
    anonKey: getOptionalEnvVar('SUPABASE_ANON_KEY'),
    bucket: getEnvVar('SUPABASE_BUCKET', 'bird-photos'),
  },

  // Haikubox
  haikubox: {
    serial: getOptionalEnvVar('HAIKUBOX_SERIAL'),
    apiBase: getEnvVar('HAIKUBOX_API_BASE', 'https://api.haikubox.com'),
    syncKey: getOptionalEnvVar('HAIKUBOX_SYNC_KEY'),
  },

  // API Authentication
  api: {
    key: getOptionalEnvVar('API_KEY'),
  },

  // File Upload
  upload: {
    maxSizeBytes: getEnvVarAsNumber('UPLOAD_MAX_SIZE', 20 * 1024 * 1024), // 20MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
  },

  // Rate Limiting
  rateLimit: {
    enabled: getEnvVarAsBoolean('RATE_LIMIT_ENABLED', true),
    windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 60000),
    readMaxRequests: getEnvVarAsNumber('RATE_LIMIT_READ_MAX', 100),
    writeMaxRequests: getEnvVarAsNumber('RATE_LIMIT_WRITE_MAX', 20),
    uploadMaxRequests: getEnvVarAsNumber('RATE_LIMIT_UPLOAD_MAX', 10),
    syncMaxRequests: getEnvVarAsNumber('RATE_LIMIT_SYNC_MAX', 5),
  },

  // Slack Webhooks
  slack: {
    supportWebhookUrl: getOptionalEnvVar('SLACK_WEBHOOK_SUPPORT'),
  },

  // Caching
  cache: {
    speciesTtlSeconds: getEnvVarAsNumber('CACHE_SPECIES_TTL', 600), // 10 minutes
    photosTtlSeconds: getEnvVarAsNumber('CACHE_PHOTOS_TTL', 300), // 5 minutes
    statsTtlSeconds: getEnvVarAsNumber('CACHE_STATS_TTL', 300), // 5 minutes
  },
} as const;

// Type export for use in other files
export type Config = typeof config;
