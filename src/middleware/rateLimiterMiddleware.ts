// src/middleware/rateLimiterMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from '../lib/rateLimiter';
import { resolveRateLimitRule } from '../config/rateLimits';
import { redisClient } from '../redisClient';

async function bumpMetrics(clientKey: string) {
  const now = Date.now();
  const currentMinute = Math.floor(now / 60000); // unix minute

  const secondsToNextMinute =
    60 - Math.floor((now / 1000) % 60); 

  const multi = redisClient.multi();

  // Total requests ever
  multi.incr('metrics:totalRequests');

  // Requests per minute (per-minute key with short TTL)
  const rpmKey = `metrics:rpm:${currentMinute}`;
  multi.incr(rpmKey);
  multi.expire(rpmKey, 120); // keep last 2 minutes

  // Active clients (approx, based on who hit us within last 10 min)
  multi.sadd('metrics:activeClients:set', clientKey);
  multi.expire('metrics:activeClients:set', 600); // 10 minutes

  // Window reset hint (we just show "time until next minute")
  multi.set('metrics:windowResetIn', String(secondsToNextMinute), 'EX', 60);

  await multi.exec();
}

export function createRateLimiterMiddleware(rateLimiter: RateLimiter) {
  return async function rateLimiterMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const clientKey = req.header('x-api-key') || req.ip || 'unknown';

      const { rule, algorithm, plan } = resolveRateLimitRule(req, clientKey);

      const result = await rateLimiter.checkAndConsume(
        clientKey,
        rule,
        algorithm
      );

      res.setHeader('X-RateLimit-Limit', rule.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', result.resetAt.toString());
      res.setHeader('X-RateLimit-Plan', plan);

      if (!result.allowed) {
        return res.status(429).json({
          error: 'too_many_requests',
          message: 'Rate limit exceeded. Please try again later.',
        });
      }

      // ✅ Only bump metrics for allowed traffic
      try {
        await bumpMetrics(clientKey);
      } catch (metricsErr) {
        console.error('[metrics] Failed to bump metrics:', metricsErr);
        // Fail-open: metrics must never block requests
      }

      return next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      // Fail-open: allow traffic if limiter is broken
      return next();
    }
  };
}
