// tests/middleware.integration.test.ts
import request from 'supertest';
import { app } from '../src/server/app';

describe('Rate limiter middleware – integration', () => {
  it('allows 5 /login requests then returns 429', async () => {
    const client = request(app);

    // First 5 should pass
    for (let i = 0; i < 5; i++) {
      const res = await client.get('/login');
      expect(res.status).toBe(200);
      expect(res.headers['x-ratelimit-limit']).toBe('5');
    }

    // 6th should be blocked
    const resExceeded = await client.get('/login');
    expect(resExceeded.status).toBe(429);
    expect(resExceeded.body.error).toBe('too_many_requests');
  });

  it('applies token-bucket rules for /api/data', async () => {
    const client = request(app);

    // We don’t exhaust the bucket here, just verify normal behavior
    const res = await client.get('/api/data');

    expect(res.status).toBe(200);
    expect(res.headers['x-ratelimit-limit']).toBe('100');
    expect(Number(res.headers['x-ratelimit-remaining'])).toBeLessThan(100);
  });
});
