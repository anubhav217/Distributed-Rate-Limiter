import express from 'express';
import { MemoryStore } from '../lib/memoryStore';
import { DefaultRateLimiter } from '../lib/rateLimiter';
import { createRateLimiterMiddleware } from '../middleware/rateLimiterMiddleware';

const app = express();
const port = process.env.PORT || 3000;

const store = new MemoryStore();
const rateLimiter = new DefaultRateLimiter(store);
const rateLimiterMiddleware = createRateLimiterMiddleware(rateLimiter);

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

app.listen(port, () => {
  console.log(`Rate-limited API listening on http://localhost:${port}`);
});
