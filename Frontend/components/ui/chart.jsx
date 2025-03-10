"use client";
import * as React from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/components/lib/utils";

const ChartContext = React.createContext({
  config: null,
});

export function ChartContainer({
  config,
  children,
  className,
  ...props
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("recharts-responsive-container", className)} {...props}>
        <ResponsiveContainer>{children}</ResponsiveContainer>

        <style jsx global>{`
          :root {
            ${Object.entries(config)
              .map(([key, value]) => {
                return value.color
                  ? `--color-${key}: ${value.color};`
                  : null
              })
              .filter(Boolean)
              .join("\n")}
          }
        `}</style>
      </div>
    </ChartContext.Provider>
  )
}

export function ChartLegend({ className, ...props }) {
  return <Legend wrapperStyle={{ paddingTop: "1.25em" }} {...props} />
}

export function ChartLegendContent({
  payload,
  className,
  ...props
}) {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {payload.map((entry) => {
        const configEntry = Object.entries(config).find(
          ([_, value]) => value.label === entry.value
        )

        if (!configEntry) {
          return null
        }

        const [key] = configEntry

        return (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ChartTooltip(props) {
  return <Tooltip {...props} />
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = (value) => value,
  indicator = "box",
  className,
  nameKey,
  ...props
}) {
  const { config } = React.useContext(ChartContext)

  if (!active || !payload || !payload.length || !config) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background shadow-sm",
        className
      )}
      {...props}
    >
      <div className="border-b px-3.5 py-2 text-center text-xs font-medium">
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      <div className="px-3.5 py-2">
        {payload.map((item) => {
          const dataKey = nameKey ? nameKey : item.dataKey
          const configEntry = Object.entries(config).find(
            ([key]) => key === dataKey
          )

          const name = configEntry?.[1].label ?? item.name
          const color = item.stroke || item.fill || item.color || "#888"

          return (
            <div key={item.dataKey} className="flex items-center gap-2 py-1">
              {indicator === "box" && (
                <div
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              )}
              {indicator === "line" && (
                <div
                  className="h-0.5 w-3"
                  style={{ backgroundColor: color }}
                />
              )}
              {indicator === "dot" && (
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              <div className="grid flex-1 grid-cols-2 items-center gap-1 text-xs">
                <span className="tabular-nums text-muted-foreground">{name}</span>
                <span className="font-medium tabular-nums">{valueFormatter(Number(item.value))}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
