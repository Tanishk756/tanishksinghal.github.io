import { Env } from '../types';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryRateLimitStore = new Map<string, RateLimitEntry>();

export type RateLimitAction = 'auth' | 'mutation' | 'publish' | 'media' | 'general';

interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_RULES: Record<RateLimitAction, RateLimitRule> = {
  auth: { maxRequests: 10, windowMs: 60 * 1000 },           // 10 attempts per minute
  mutation: { maxRequests: 60, windowMs: 60 * 1000 },       // 60 mutations per minute
  publish: { maxRequests: 10, windowMs: 5 * 60 * 1000 },    // 10 publishes per 5 minutes
  media: { maxRequests: 30, windowMs: 60 * 1000 },          // 30 media operations per minute
  general: { maxRequests: 120, windowMs: 60 * 1000 },       // 120 read requests per minute
};

export function checkRateLimit(
  request: Request,
  env: Env,
  action: RateLimitAction = 'general'
): { allowed: boolean; retryAfter?: number } {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown-client';
  const key = `${action}:${ip}`;

  const rule = RATE_LIMIT_RULES[action] || RATE_LIMIT_RULES.general;
  const now = Date.now();

  const entry = memoryRateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryRateLimitStore.set(key, {
      count: 1,
      resetAt: now + rule.windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= rule.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}
