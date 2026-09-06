/**
 * Edge Function Rate Limiter
 * 
 * Provides per-IP / per-identity request rate limiting for mutations, publish jobs, and general queries.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const RATE_LIMIT_RULES: Record<string, RateLimitConfig> = {
  general: { maxRequests: 100, windowSeconds: 60 },
  mutation: { maxRequests: 30, windowSeconds: 60 },
  publish: { maxRequests: 5, windowSeconds: 60 },
  media: { maxRequests: 20, windowSeconds: 60 },
};

interface ClientHistory {
  timestamps: number[];
}

const rateLimitStore = new Map<string, ClientHistory>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export function checkRateLimit(
  request: Request,
  actionType: 'general' | 'mutation' | 'publish' | 'media' = 'general'
): RateLimitResult {
  const config = RATE_LIMIT_RULES[actionType] || RATE_LIMIT_RULES.general;
  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  const key = `${actionType}:${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  const history = rateLimitStore.get(key) || { timestamps: [] };
  // Remove expired timestamps
  const activeTimestamps = history.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= config.maxRequests) {
    const oldest = activeTimestamps[0];
    const retryAfter = Math.ceil((oldest + config.windowSeconds * 1000 - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(retryAfter, 1),
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: config.maxRequests - activeTimestamps.length,
    retryAfter: 0,
  };
}
