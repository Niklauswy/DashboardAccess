"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart as ReChartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export function BarChart({ title, data, xKey, yKey, color = "#adfa1d" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <ReChartsBarChart data={data}>
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yKey} fill={color} />
          </ReChartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
