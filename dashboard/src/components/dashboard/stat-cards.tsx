"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockStats = {
  totalRequests: 12840,
  allowedRequests: 11920,
  blockedRequests: 920,
  activeKeys: 18,
};

export function StatCards() {
  const { totalRequests, allowedRequests, blockedRequests, activeKeys } =
    mockStats;

  const blockRate = ((blockedRequests / totalRequests) * 100).toFixed(1);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Requests (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold">{totalRequests.toLocaleString()}</div>
          <Badge variant="outline" className="text-xs">
            All plans
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Allowed / Blocked
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">
            Allowed:{" "}
            <span className="font-semibold text-foreground">
              {allowedRequests.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Blocked:{" "}
            <span className="font-semibold text-destructive">
              {blockedRequests.toLocaleString()} ({blockRate}%)
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold">{activeKeys}</div>
          <Badge variant="secondary" className="text-xs">
            Free / Pro / Enterprise
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Approx. Block Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold">{blockRate}%</div>
          <span className="text-xs text-muted-foreground">
            Of total traffic
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
