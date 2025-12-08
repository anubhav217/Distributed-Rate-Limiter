import { Algorithm, RateLimitRule } from '../lib/types';

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface ApiKeyConfig {
  key: string;
  plan: PlanId;
  label?: string;
}

/**
 * Demo API keys.
 * In a real system, you’d pull these from a DB or environment.
 */
export const API_KEYS: ApiKeyConfig[] = [
  { key: 'FREE-DEMO-KEY', plan: 'free', label: 'Example Free key' },
  { key: 'PRO-DEMO-KEY', plan: 'pro', label: 'Example Pro key' },
  {
    key: 'ENTERPRISE-DEMO-KEY',
    plan: 'enterprise',
    label: 'Example Enterprise key',
  },
];

/**
 * Given an API key (or undefined), decide which plan it maps to.
 * - Known key → its configured plan
 * - Unknown / missing key → default to "free"
 */
export function resolvePlanFromApiKey(apiKey?: string | null): PlanId {
  if (!apiKey) return 'free';

  const trimmed = apiKey.trim();
  const match = API_KEYS.find((k) => k.key === trimmed);

  return match?.plan ?? 'free';
}

export interface RoutePlanRule {
  routePrefix: string;
  algorithm: Algorithm;
  rules: Record<PlanId, RateLimitRule>;
}

/**
 * Per-plan rules for different route groups.
 * You can tweak these numbers to taste; they’re just sane defaults.
 */
export const ROUTE_PLAN_RULES: RoutePlanRule[] = [
  {
    // login is kept strict for everyone, but higher plans get a bit more headroom
    routePrefix: '/login',
    algorithm: 'fixed-window',
    rules: {
      free: {
        maxRequests: 5,
        windowMs: 60_000,
      },
      pro: {
        maxRequests: 10,
        windowMs: 60_000,
      },
      enterprise: {
        maxRequests: 20,
        windowMs: 60_000,
      },
    },
  },
  {
    // main API traffic gets token-bucket behaviour
    routePrefix: '/api',
    algorithm: 'token-bucket',
    rules: {
      // effectively ~60 req/min
      free: {
        maxRequests: 60,
        windowMs: 60_000,
        bucketCapacity: 60,
        refillRatePerSec: 1,
      },
      // ~600 req/min
      pro: {
        maxRequests: 600,
        windowMs: 60_000,
        bucketCapacity: 600,
        refillRatePerSec: 10,
      },
      // ~6000 req/min
      enterprise: {
        maxRequests: 6000,
        windowMs: 60_000,
        bucketCapacity: 6000,
        refillRatePerSec: 100,
      },
    },
  },
];

/**
 * Fallback rule if no routePrefix matches.
 * Keep it modest but not super restrictive.
 */
export const DEFAULT_ROUTE_RULE: RoutePlanRule = {
  routePrefix: 'default',
  algorithm: 'token-bucket',
  rules: {
    free: {
      maxRequests: 100,
      windowMs: 60_000,
      bucketCapacity: 100,
    },
    pro: {
      maxRequests: 300,
      windowMs: 60_000,
      bucketCapacity: 300,
    },
    enterprise: {
      maxRequests: 1_000,
      windowMs: 60_000,
      bucketCapacity: 1_000,
    },
  },
};
