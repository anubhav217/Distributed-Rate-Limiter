import { RateLimitStore, FixedWindowState, TokenBucketState } from './store';

interface FixedWindowEntry {
  count: number;
  windowStart: number; // ms
}

interface TokenBucketEntry {
  tokens: number;
  lastRefillAt: number; // ms
}

export class MemoryStore implements RateLimitStore {
  private fixedWindows = new Map<string, FixedWindowEntry>();
  private buckets = new Map<string, TokenBucketEntry>();

  async incrementWindowCounter(
    key: string,
    windowMs: number
  ): Promise<FixedWindowState> {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const resetAt = windowStart + windowMs;

    const existing = this.fixedWindows.get(key);
    if (!existing || existing.windowStart !== windowStart) {
      this.fixedWindows.set(key, { count: 1, windowStart });
      return { current: 1, resetAt };
    }

    existing.count += 1;
    this.fixedWindows.set(key, existing);
    return { current: existing.count, resetAt };
  }

  async consumeToken(
    key: string,
    capacity: number,
    refillRatePerSec: number
  ): Promise<TokenBucketState> {
    const now = Date.now();

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, lastRefillAt: now };
    }

    const elapsedSec = (now - bucket.lastRefillAt) / 1000;
    const tokensToAdd = elapsedSec * refillRatePerSec;
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefillAt = now;

    let allowed = false;
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      allowed = true;
    }

    this.buckets.set(key, bucket);

    const missingTokens = capacity - bucket.tokens;
    const secondsToFull = missingTokens / refillRatePerSec;
    const resetAt = now + secondsToFull * 1000;

    return {
      allowed,
      tokensLeft: Math.max(0, Math.floor(bucket.tokens)),
      resetAt,
    };
  }
}
