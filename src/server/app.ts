import express from 'express';
import Redis from 'ioredis';
import { metricsRouter } from "../routes/metrics";
import { MemoryStore } from '../lib/memoryStore';
import { RedisStore } from '../lib/redisStore';
import { redisClient } from "../redisClient";
import { DefaultRateLimiter } from '../lib/rateLimiter';
import { createRateLimiterMiddleware } from '../middleware/rateLimiterMiddleware';
import type { RateLimitStore } from '../lib/store';
import { config } from '../config/env';

export const app = express();
const port = config.port;

let store: RateLimitStore;

switch (config.storeBackend) {
  case 'memory': {
    console.log('[config] Using MemoryStore backend');
    store = new MemoryStore();
    break;
  }
  case 'redis': {
    console.log(
      `[config] Using RedisStore backend (REDIS_URL=${config.redisUrl})`,
    );
    const redis = new Redis(config.redisUrl);
    redis.on('error', (err) => {
      console.error('[redis] connection error:', err);
    });
    store = new RedisStore(redis);
    break;
  }
  default: {
    console.warn(
      `[config] Unknown STORE_BACKEND="${config.storeBackend}", falling back to MemoryStore.`,
    );
    store = new MemoryStore();
    break;
  }
}

const rateLimiter = new DefaultRateLimiter(store);
const rateLimiterMiddleware = createRateLimiterMiddleware(rateLimiter);

app.use(rateLimiterMiddleware);

// ------------------ NEW: Metrics endpoint ------------------
app.use("/metrics", metricsRouter);
// -----------------------------------------------------------

app.get('/', (_req, res) => {
  res.send('Rate Limiter is running. Try /health, /login, or /api/data');
});

app.get('/login', (_req, res) => {
  res.json({ message: 'Login endpoint (5 req/min fixed-window)' });
});

app.get('/api/data', (_req, res) => {
  res.json({ message: 'Data endpoint (100 req/min token bucket)' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Rate-limited API listening on http://localhost:${port}`);
  });
}
