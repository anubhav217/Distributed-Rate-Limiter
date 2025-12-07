export type Algorithm = 'fixed-window' | 'token-bucket';

export interface RateLimitRule {
  // for fixed window
  maxRequests: number;   // e.g., 100
  windowMs?: number;     // e.g., 60_000

  // for token bucket
  bucketCapacity?: number;    // max tokens
  refillRatePerSec?: number;  // tokens added per second
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix timestamp in ms when limit resets / bucket refills
}
