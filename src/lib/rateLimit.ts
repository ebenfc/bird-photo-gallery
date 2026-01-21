interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (works for single instance deployment)
const requestCounts = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetAt) {
        requestCounts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// Default rate limits for different endpoint types
export const RATE_LIMITS = {
  // Read operations - more permissive
  read: { maxRequests: 100, windowMs: 60000 },
  // Write operations - more restrictive
  write: { maxRequests: 20, windowMs: 60000 },
  // Upload operations - most restrictive
  upload: { maxRequests: 10, windowMs: 60000 },
  // Sync operations - expensive, very restrictive
  sync: { maxRequests: 5, windowMs: 60000 },
  // Default fallback
  default: { maxRequests: 60, windowMs: 60000 },
} as const;

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.default
): RateLimitResult {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // No record or expired - allow and create new record
  if (!record || now > record.resetAt) {
    const resetAt = now + config.windowMs;
    requestCounts.set(identifier, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt
    };
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt
    };
  }

  // Increment count
  record.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt
  };
}

/**
 * Get IP address from request
 */
export function getClientIp(request: Request): string {
  // Check X-Forwarded-For header (set by Railway/proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  // Fallback to x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to cf-connecting-ip (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }

  return 'unknown';
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  config: RateLimitConfig
): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

  return Response.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfter
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString()
      }
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
  config: RateLimitConfig
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetAt.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Rate limit middleware for API routes
 * Use this wrapper for individual route handlers
 */
export function withRateLimit(
  handler: (request: Request, context?: unknown) => Promise<Response>,
  config: RateLimitConfig = RATE_LIMITS.default
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    const ip = getClientIp(request);
    const path = new URL(request.url).pathname;
    const method = request.method;

    // Create unique identifier based on IP, path, and method
    const identifier = `${ip}:${method}:${path}`;
    const result = checkRateLimit(identifier, config);

    if (!result.allowed) {
      return createRateLimitResponse(result, config);
    }

    // Call original handler
    const response = await handler(request, context);

    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, result, config);
  };
}

/**
 * Check rate limit and return response if exceeded
 * Use this in route handlers for more control
 */
export function checkAndGetRateLimitResponse(
  request: Request,
  config: RateLimitConfig = RATE_LIMITS.default
): { allowed: true; result: RateLimitResult } | { allowed: false; response: Response } {
  const ip = getClientIp(request);
  const path = new URL(request.url).pathname;
  const method = request.method;

  const identifier = `${ip}:${method}:${path}`;
  const result = checkRateLimit(identifier, config);

  if (!result.allowed) {
    return {
      allowed: false,
      response: createRateLimitResponse(result, config)
    };
  }

  return { allowed: true, result };
}
