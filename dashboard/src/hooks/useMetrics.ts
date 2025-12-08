"use client";

import useSWR from "swr";

export interface Metrics {
  totalRequests: number;
  requestsPerMinute: number;
  activeClients: number;
  windowResetIn: number;
  redisConnected: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_RATE_LIMITER_API || "http://localhost:3001";

const fetcher = async (url: string): Promise<Metrics> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics: ${res.status}`);
  }
  return res.json();
};

export function useMetrics() {
  console.log("Metrics API base:", API_BASE); // <— keep this for now

  const { data, error, isLoading } = useSWR<Metrics>(
    `${API_BASE}/metrics`,   // << this MUST be /metrics
    fetcher,
    {
      refreshInterval: 3000,
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: !!error,
  };
}
