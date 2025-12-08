import { Router, Request, Response } from "express";
import { redisClient } from "../redisClient";

export const metricsRouter = Router();

interface MetricsResponse {
  totalRequests: number;
  requestsPerMinute: number;
  activeClients: number;
  windowResetIn: number; // seconds
  redisConnected: boolean;
}

metricsRouter.get("/", async (req: Request, res: Response) => {
  try {
    let redisConnected = false;
    try {
      redisConnected = (await redisClient.ping()) === "PONG";
    } catch {
      redisConnected = false;
    }

    const [
      totalRequestsStr,
      requestsPerMinuteStr,
      activeClientsStr,
      windowResetInStr,
    ] = await redisClient.mget([
      "metrics:totalRequests",
      "metrics:requestsPerMinute",
      "metrics:activeClients",
      "metrics:windowResetIn",
    ]);

    const response: MetricsResponse = {
      totalRequests: totalRequestsStr ? Number(totalRequestsStr) : 0,
      requestsPerMinute: requestsPerMinuteStr ? Number(requestsPerMinuteStr) : 0,
      activeClients: activeClientsStr ? Number(activeClientsStr) : 0,
      windowResetIn: windowResetInStr ? Number(windowResetInStr) : 0,
      redisConnected,
    };

    res.json(response);
  } catch (err) {
    console.error("Error in /metrics:", err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});
