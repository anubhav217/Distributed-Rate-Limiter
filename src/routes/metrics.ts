import { Router, Request, Response } from 'express';
import { redisClient } from '../redisClient';

export const metricsRouter = Router();

interface MetricsResponse {
  totalRequests: number;
  requestsPerMinute: number;
  activeClients: number;
  windowResetIn: number; // seconds
  redisConnected: boolean;
}

metricsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    let redisConnected = false;
    try {
      redisConnected = (await redisClient.ping()) === 'PONG';
    } catch {
      redisConnected = false;
    }

    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);

    const [
      totalRequestsStr,
      rpmStr,
      activeClientsCount,
      windowResetInStr,
    ] = await Promise.all([
      redisConnected
        ? redisClient.get('metrics:totalRequests')
        : Promise.resolve(null),
      redisConnected
        ? redisClient.get(`metrics:rpm:${currentMinute}`)
        : Promise.resolve(null),
      redisConnected
        ? redisClient.scard('metrics:activeClients:set')
        : Promise.resolve(0),
      redisConnected
        ? redisClient.get('metrics:windowResetIn')
        : Promise.resolve(null),
    ]);

    const response: MetricsResponse = {
      totalRequests: totalRequestsStr ? Number(totalRequestsStr) : 0,
      requestsPerMinute: rpmStr ? Number(rpmStr) : 0,
      activeClients:
        typeof activeClientsCount === 'number' ? activeClientsCount : 0,
      windowResetIn: windowResetInStr ? Number(windowResetInStr) : 0,
      redisConnected,
    };

    res.json(response);
  } catch (err) {
    console.error('[metrics] Error in /metrics:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});
