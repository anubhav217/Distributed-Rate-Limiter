"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const rows = [
  {
    key: "key_free_123",
    plan: "free",
    endpoint: "/api/data",
    status: "allowed",
    remaining: 87,
  },
  {
    key: "key_pro_456",
    plan: "pro",
    endpoint: "/login",
    status: "blocked",
    remaining: 0,
  },
  {
    key: "key_ent_789",
    plan: "enterprise",
    endpoint: "/api/data",
    status: "allowed",
    remaining: 998,
  },
];

export function RecentActivityTable() {
  return (
    <Card id="logs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Recent Requests (sample data)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[220px]">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">API Key</th>
                <th className="py-2">Plan</th>
                <th className="py-2">Endpoint</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.key}-${row.endpoint}`} className="border-b last:border-b-0">
                  <td className="py-2 align-middle font-mono text-xs">
                    {row.key}
                  </td>
                  <td className="py-2 align-middle">
                    <Badge variant="outline" className="capitalize">
                      {row.plan}
                    </Badge>
                  </td>
                  <td className="py-2 align-middle">{row.endpoint}</td>
                  <td className="py-2 align-middle">
                    <Badge
                      variant={row.status === "allowed" ? "default" : "destructive"}
                      className="text-[10px] uppercase"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-2 align-middle text-right font-mono text-xs">
                    {row.remaining}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
