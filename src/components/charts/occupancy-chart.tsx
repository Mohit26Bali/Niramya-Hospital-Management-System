"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROOM_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#10b981",
  OCCUPIED: "#ef4444",
  CLEANING: "#94a3b8",
};

export function OccupancyChart({ data }: { data: { type: string; status: string; count: number }[] }) {
  const byStatus = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + row.count;
    return acc;
  }, {});
  const chartData = Object.entries(byStatus).map(([status, count]) => ({
    status,
    label: ROOM_STATUS_LABELS[status as keyof typeof ROOM_STATUS_LABELS] ?? status,
    count,
  }));

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Room occupancy</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
