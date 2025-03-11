"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function LabeledBarChart({ 
  title, 
  description, 
  data, 
  dataKey, 
  nameKey, 
  vertical = false, 
  color = "hsl(var(--chart-1))", 
  footer 
}) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey,
      color: color
    },
    label: {
      color: "hsl(var(--background))"
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart
            accessibilityLayer
            data={data}
            layout={vertical ? "vertical" : "horizontal"}
            margin={{
              top: 20,
              right: 16,
              bottom: 20,
              left: 16,
            }}
          >
            <CartesianGrid horizontal={!vertical} vertical={vertical} />
            {vertical ? (
              <>
                <YAxis
                  dataKey={nameKey}
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={nameKey}
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
              </>
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              radius={4}
            >
              <LabelList
                dataKey={dataKey}
                position={vertical ? "right" : "top"}
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer && (
        <CardFooter className="text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
