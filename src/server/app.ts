// src/server/app.ts
import express from 'express';
import cors from "cors";
import { metricsRouter } from '../routes/metrics';

import { MemoryStore } from '../lib/memoryStore';
import { RedisStore } from '../lib/redisStore';
import { DefaultRateLimiter } from '../lib/rateLimiter';
import { createRateLimiterMiddleware } from '../middleware/rateLimiterMiddleware';
import type { RateLimitStore } from '../lib/store';
import { config } from '../config/env';
import { redisClient } from '../redisClient';

export const app = express();
const port = config.port;

// ✅ CORS must come BEFORE routes
app.use(
  cors({
    origin: "http://localhost:3000", // dashboard origin
  })
);

app.use(express.json());

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
    // ✅ Use shared redis client
    store = new RedisStore(redisClient);
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

// ✅ Metrics endpoint
app.use('/metrics', metricsRouter);


const rateLimiter = new DefaultRateLimiter(store);
const rateLimiterMiddleware = createRateLimiterMiddleware(rateLimiter);

// Apply rate limiter to all routes
app.use(rateLimiterMiddleware);


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

// Only listen when run directly (not when imported in tests)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Rate-limited API listening on http://localhost:${port}`);
  });
}
