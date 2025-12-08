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

const data = [
  { time: "00:00", allowed: 120, blocked: 5 },
  { time: "04:00", allowed: 220, blocked: 10 },
  { time: "08:00", allowed: 540, blocked: 18 },
  { time: "12:00", allowed: 820, blocked: 32 },
  { time: "16:00", allowed: 780, blocked: 28 },
  { time: "20:00", allowed: 620, blocked: 24 },
  { time: "24:00", allowed: 410, blocked: 15 },
];

export function RequestChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Requests Over Time (Today)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="allowed"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="blocked"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
