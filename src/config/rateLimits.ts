import { Algorithm, RateLimitRule } from '../lib/types';
import { Request } from 'express';

export interface ResolvedRule {
  rule: RateLimitRule;
  algorithm: Algorithm;
}

/**
 * Resolve a rate limit rule based on route, method, user plan etc.
 * For now: simple examples.
 */
export function resolveRateLimitRule(
  req: Request,
  _clientKey: string
): ResolvedRule {
  if (req.path.startsWith('/login')) {
    return {
      algorithm: 'fixed-window',
      rule: {
        maxRequests: 5,
        windowMs: 60_000,
      },
    };
  }

  // default: 100 req/min token bucket
  return {
    algorithm: 'token-bucket',
    rule: {
      maxRequests: 100,
      windowMs: 60_000,
      bucketCapacity: 100,
      // refillRatePerSec will be derived if omitted
    },
  };
}
