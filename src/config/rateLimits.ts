import { Algorithm, RateLimitRule } from '../lib/types';
import { Request } from 'express';
import {
  PlanId,
  resolvePlanFromApiKey,
  ROUTE_PLAN_RULES,
  DEFAULT_ROUTE_RULE,
} from './apiPlans';

export interface ResolvedRule {
  rule: RateLimitRule;
  algorithm: Algorithm;
  plan: PlanId;
}

/**
 * Resolve a rate limit rule based on:
 * - route (path prefix)
 * - client plan (free / pro / enterprise)
 * - API key (from x-api-key header)
 */
export function resolveRateLimitRule(
  req: Request,
  clientKey: string
): ResolvedRule {
  // 1) Determine plan from key
  const plan = resolvePlanFromApiKey(clientKey);

  // 2) Find route group by prefix, e.g. /login, /api
  const routeConfig =
    ROUTE_PLAN_RULES.find((cfg) => req.path.startsWith(cfg.routePrefix)) ??
    DEFAULT_ROUTE_RULE;

  // 3) Pick the rule for this plan (fallback to "free" if somehow missing)
  const ruleForPlan: RateLimitRule =
    routeConfig.rules[plan] ?? routeConfig.rules.free;

  return {
    algorithm: routeConfig.algorithm,
    rule: ruleForPlan,
    plan,
  };
}
