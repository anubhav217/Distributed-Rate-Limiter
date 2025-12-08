"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useMetrics } from "../../hooks/useMetrics";

interface ChartPoint {
  time: string;
  allowed: number;
}

export function RequestChart() {
  const { metrics, isLoading, isError } = useMetrics();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [mounted, setMounted] = useState(false);

  // Ensure chart only renders on the client to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!metrics) return;

    const now = new Date();
    const time = now.toLocaleTimeString();

    setData((prev) => {
      const next = [...prev, { time, allowed: metrics.requestsPerMinute }];
      return next.slice(-30);
    });
  }, [metrics]); // track metrics object instead of optional chaining

  // Skeleton while loading or before mount (prevents SSR <-> client mismatch)
  if ((!mounted || isLoading) && data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Requests Over Time (Live)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] pt-2">
          <div className="h-full w-full rounded-2xl bg-neutral-900/60 border border-neutral-800 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    const apiBase =
      process.env.NEXT_PUBLIC_RATE_LIMITER_API || "http://localhost:3001";

    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Requests Over Time (Live)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] pt-2">
          <div className="h-full w-full rounded-2xl border border-red-500/40 bg-red-500/10 text-xs p-3">
            Failed to load metrics for chart. Is the API running on {apiBase}?
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Requests Over Time (Live)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] pt-2">
        <div className="h-full w-full min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="allowed"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default RequestChart;
