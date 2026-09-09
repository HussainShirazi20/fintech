"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/features";
import type { Features } from "@/lib/types";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function CategoryBar({ features }: { features: Features }) {
  const data = features.categoryTotals.slice(0, 7).map((c) => ({
    name: c.category.length > 14 ? c.category.slice(0, 13) + "…" : c.category,
    total: c.total,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Where the money went</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} fontSize={12} />
            <YAxis type="category" dataKey="name" width={110} fontSize={12} />
            <Tooltip formatter={(v) => [formatINR(Number(v)), "Spent"]} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RhythmChart({ features }: { features: Features }) {
  const data = [
    { name: "Weekdays", total: features.weekdaySpend },
    { name: "Weekends", total: features.weekendSpend },
    { name: "Days 1–15", total: features.firstHalfSpend },
    { name: "Days 16–31", total: features.secondHalfSpend },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending rhythm</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`} fontSize={12} />
            <Tooltip formatter={(v) => [formatINR(Number(v)), "Spent"]} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
