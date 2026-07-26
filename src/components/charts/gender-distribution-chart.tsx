"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GENDER_COLORS: Record<string, string> = {
  MALE: "var(--chart-1)",
  FEMALE: "var(--chart-2)",
  OTHER: "var(--chart-3)",
};

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export function GenderDistributionChart({ data }: { data: { gender: string; count: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: GENDER_LABELS[d.gender] ?? d.gender }));

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Gender distribution</CardTitle>
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
                <Cell key={entry.gender} fill={GENDER_COLORS[entry.gender] ?? "var(--chart-5)"} />
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
