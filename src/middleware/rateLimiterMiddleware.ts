import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from '../lib/rateLimiter';
import { resolveRateLimitRule } from '../config/rateLimits';

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

      return next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      // Fail-open: allow traffic if limiter is broken
      return next();
    }
  };
}
