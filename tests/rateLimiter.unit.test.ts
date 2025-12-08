import { MemoryStore } from '../src/lib/memoryStore';
import { DefaultRateLimiter } from '../src/lib/rateLimiter';
import type { RateLimitRule } from '../src/lib/types';

describe('DefaultRateLimiter – fixed-window', () => {
  const rule: RateLimitRule = {
    maxRequests: 5,
    windowMs: 60_000,
  };

  it('allows up to maxRequests in the same window', async () => {
    const store = new MemoryStore();
    const limiter = new DefaultRateLimiter(store);
    const key = 'user:fixed:test';

    const allowed: boolean[] = [];

    for (let i = 0; i < rule.maxRequests; i++) {
      const result = await limiter.checkAndConsume(key, rule, 'fixed-window');
      allowed.push(result.allowed);
    }

    expect(allowed.every(Boolean)).toBe(true);
  });

  it('blocks when exceeding maxRequests in the same window', async () => {
    const store = new MemoryStore();
    const limiter = new DefaultRateLimiter(store);
    const key = 'user:fixed:overflow';

    for (let i = 0; i < rule.maxRequests; i++) {
      await limiter.checkAndConsume(key, rule, 'fixed-window');
    }

    const afterLimit = await limiter.checkAndConsume(key, rule, 'fixed-window');

    expect(afterLimit.allowed).toBe(false);
    expect(afterLimit.remaining).toBe(0);
    expect(afterLimit.resetAt).toBeGreaterThan(Date.now());
  });
});

describe('DefaultRateLimiter – token-bucket', () => {
  const rule: RateLimitRule = {
    maxRequests: 10,
    windowMs: 10_000,
    bucketCapacity: 10,
  };

  it('allows up to capacity immediately', async () => {
    const store = new MemoryStore();
    const limiter = new DefaultRateLimiter(store);
    const key = 'user:tb:test';

    const allowed: boolean[] = [];

    for (let i = 0; i < (rule.bucketCapacity ?? 0); i++) {
      const result = await limiter.checkAndConsume(key, rule, 'token-bucket');
      allowed.push(result.allowed);
    }

    expect(allowed.filter(Boolean).length).toBe(rule.bucketCapacity);
  });

  it('denies once the bucket is empty', async () => {
    const store = new MemoryStore();
    const limiter = new DefaultRateLimiter(store);
    const key = 'user:tb:empty';

    for (let i = 0; i < (rule.bucketCapacity ?? 0); i++) {
      await limiter.checkAndConsume(key, rule, 'token-bucket');
    }

    const res = await limiter.checkAndConsume(key, rule, 'token-bucket');

    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.resetAt).toBeGreaterThan(Date.now());
  });
});
