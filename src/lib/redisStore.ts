import Redis from 'ioredis';
import {
  RateLimitStore,
  FixedWindowState,
  TokenBucketState,
} from './store';

export class RedisStore implements RateLimitStore {
  private client: Redis;
  private prefix: string;

  constructor(client: Redis, prefix = 'rl') {
    this.client = client;
    this.prefix = prefix;
  }

  // ---------- Fixed-window implementation ----------

  async incrementWindowCounter(
    key: string,
    windowMs: number,
  ): Promise<FixedWindowState> {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const resetAt = windowStart + windowMs;

    const redisKey = this.fixedWindowKey(key, windowMs, windowStart);

    // Simple but effective: INCR + PEXPIRE
    const current = await this.client.incr(redisKey);
    // Refresh TTL on each hit; slightly conservative but fine for usage
    await this.client.pexpire(redisKey, windowMs);

    return { current, resetAt };
  }

  // ---------- Token-bucket implementation (Lua script for atomicity) ----------

  async consumeToken(
    key: string,
    capacity: number,
    refillRatePerSec: number,
  ): Promise<TokenBucketState> {
    const now = Date.now();
    const redisKey = this.tokenBucketKey(key);

    // TTL: ~2x time to go from 0 → full, so idle keys are cleaned up
    const timeToFullMs =
      refillRatePerSec > 0
        ? (capacity / refillRatePerSec) * 1000
        : 60_000;
    const ttlMs = Math.max(timeToFullMs * 2, 60_000); // at least 60s

    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local now_ms = tonumber(ARGV[3])
      local ttl_ms = tonumber(ARGV[4])

      local data = redis.call('HMGET', key, 'tokens', 'lastRefillAt')
      local tokens = tonumber(data[1])
      local last_refill = tonumber(data[2])

      if not tokens or not last_refill then
        tokens = capacity
        last_refill = now_ms
      end

      local elapsed_sec = (now_ms - last_refill) / 1000.0
      if elapsed_sec < 0 then
        elapsed_sec = 0
      end

      local tokens_to_add = elapsed_sec * refill_rate
      tokens = math.min(capacity, tokens + tokens_to_add)
      last_refill = now_ms

      local allowed = 0
      if tokens >= 1.0 then
        tokens = tokens - 1.0
        allowed = 1
      end

      redis.call('HMSET', key, 'tokens', tokens, 'lastRefillAt', last_refill)
      redis.call('PEXPIRE', key, ttl_ms)

      local missing_tokens = capacity - tokens
      if refill_rate <= 0 then
        missing_tokens = capacity
      end
      local seconds_to_full = missing_tokens / refill_rate
      if refill_rate <= 0 then
        seconds_to_full = ttl_ms / 1000.0
      end
      local reset_at = now_ms + (seconds_to_full * 1000.0)

      return { allowed, tokens, reset_at }
    `;

    const result = (await this.client.eval(
      script,
      1,
      redisKey,
      capacity,
      refillRatePerSec,
      now,
      ttlMs,
    )) as [number, number, number];

    const allowed = result[0] === 1;
    const tokensLeft = Math.max(0, Math.floor(result[1]));
    const resetAt = Math.floor(result[2]);

    return { allowed, tokensLeft, resetAt };
  }

  // ---------- Helpers ----------

  private fixedWindowKey(
    key: string,
    windowMs: number,
    windowStart: number,
  ): string {
    return `${this.prefix}:fw:${key}:${windowMs}:${windowStart}`;
  }

  private tokenBucketKey(key: string): string {
    return `${this.prefix}:tb:${key}`;
  }
}
