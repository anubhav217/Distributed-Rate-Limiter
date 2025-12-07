import { Algorithm, RateLimitRule, RateLimitResult } from './types';
import { RateLimitStore } from './store';

export interface RateLimiter {
  checkAndConsume(
    key: string,
    rule: RateLimitRule,
    algorithm: Algorithm
  ): Promise<RateLimitResult>;
}

export class DefaultRateLimiter implements RateLimiter {
  constructor(private readonly store: RateLimitStore) {}

  async checkAndConsume(
    key: string,
    rule: RateLimitRule,
    algorithm: Algorithm
  ): Promise<RateLimitResult> {
    if (algorithm === 'fixed-window') {
      if (!rule.windowMs) {
        throw new Error('windowMs is required for fixed-window algorithm');
      }

      const { current, resetAt } = await this.store.incrementWindowCounter(
        key,
        rule.windowMs
      );

      const remaining = Math.max(0, rule.maxRequests - current);

      return {
        allowed: current <= rule.maxRequests,
        remaining,
        resetAt,
      };
    }

    // token-bucket
    const capacity = rule.bucketCapacity ?? rule.maxRequests;
    const refillRatePerSec =
      rule.refillRatePerSec ??
      rule.maxRequests / ((rule.windowMs ?? 60_000) / 1000);

    const { allowed, tokensLeft, resetAt } = await this.store.consumeToken(
      key,
      capacity,
      refillRatePerSec
    );

    return {
      allowed,
      remaining: tokensLeft,
      resetAt,
    };
  }
}
