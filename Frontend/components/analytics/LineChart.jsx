"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Legend, Line, LineChart as ReChartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function LineChart({ title, data, lines = [], xAxisKey }) {
  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <ReChartsLineChart data={data}>
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {lines.map((line, index) => (
              <Line 
                key={line.dataKey}
                type="monotone" 
                dataKey={line.dataKey} 
                stroke={colors[index % colors.length]} 
                name={line.name || line.dataKey}
              />
            ))}
          </ReChartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
