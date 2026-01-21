/**
 * Simple in-memory caching layer
 * For single-instance deployments like Railway
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Singleton cache instance
export const cache = new Cache();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.clearExpired();
  }, 5 * 60 * 1000);
}

// Cache key builders for consistency
export const cacheKeys = {
  speciesList: () => 'species:list',
  speciesById: (id: number) => `species:${id}`,
  photosList: (params: string) => `photos:list:${params}`,
  photoById: (id: number) => `photo:${id}`,
  haikuboxStats: () => 'haikubox:stats',
  haikuboxDetections: (params: string) => `haikubox:detections:${params}`,
};

/**
 * Get or fetch pattern - returns cached value or fetches and caches
 */
export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the result
  cache.set(key, data, ttlSeconds);

  return data;
}

/**
 * Invalidate cache entries related to species
 */
export function invalidateSpeciesCache(speciesId?: number): void {
  cache.delete(cacheKeys.speciesList());
  if (speciesId) {
    cache.delete(cacheKeys.speciesById(speciesId));
  }
  // Also invalidate photos cache as they include species info
  cache.deletePattern('^photos:');
}

/**
 * Invalidate cache entries related to photos
 */
export function invalidatePhotosCache(photoId?: number): void {
  cache.deletePattern('^photos:');
  if (photoId) {
    cache.delete(cacheKeys.photoById(photoId));
  }
}

/**
 * Invalidate Haikubox-related cache
 */
export function invalidateHaikuboxCache(): void {
  cache.delete(cacheKeys.haikuboxStats());
  cache.deletePattern('^haikubox:');
}
