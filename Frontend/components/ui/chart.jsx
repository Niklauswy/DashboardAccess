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

const ChartContext = React.createContext({})

export function ChartContainer({
  config,
  children,
  className,
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <style>
        {config &&
          Object.entries(config).map(([key, value]) => {
            return `
              :root {
                --color-${key}: ${value.color};
              }
            `
          })}
      </style>
      <div className={className} style={{ width: "100%", height: "100%" }}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function ChartTooltip({
  children,
  ...props
}) {
  const content = children || <ChartTooltipContent />
  return <Tooltip content={content} {...props} />
}

function Tooltip({ active, payload, content }) {
  if (!active || !payload) {
    return null
  }

  return <div className="tooltip-container">{content}</div>
}

export function ChartTooltipContent({
  indicator = "dot",
} = {}) {
  const { config } = React.useContext(ChartContext)
  const ref = React.useRef(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const el = ref.current
    const parent = el?.parentElement
    if (parent) {
      parent.style.backgroundColor = "var(--background)"
      parent.style.border = "1px solid var(--border)"
      parent.style.borderRadius = "var(--radius)"
      parent.style.padding = "8px"
      parent.style.boxShadow = "var(--shadow)"
    }
  }, [])

  return (
    <div ref={ref} className="text-sm">
      <style>
        {`
          .tooltip-item-dot::before {
            content: "";
            display: block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--dot-color);
          }
          .tooltip-item-line::before {
            content: "";
            display: block;
            width: 12px;
            height: 3px;
            background: var(--dot-color);
          }
          .recharts-tooltip-wrapper {
            z-index: 1000;
          }
        `}
      </style>
      {mounted && (
        <TooltipContent config={config} indicator={indicator} />
      )}
    </div>
  )
}

function TooltipContent({
  config,
  indicator,
}) {
  const tooltipRef = React.useRef(null)
  const [payload, setPayload] = React.useState(null)

  React.useEffect(() => {
    const tooltipEl = tooltipRef.current
    if (!tooltipEl) return

    // Find the tooltip wrapper
    const tooltipWrapper = tooltipEl.closest(".recharts-tooltip-wrapper")

    if (tooltipWrapper) {
      const observer = new MutationObserver(() => {
        // Once we observe mutations, get the payload
        const tooltipContentEl = tooltipWrapper.querySelector(".tooltip-container")
        if (tooltipContentEl) {
          const rechartsTipEl = tooltipWrapper.querySelector(".recharts-tooltip-item-list")
          if (rechartsTipEl) {
            const tipPayload = Array.from(rechartsTipEl.querySelectorAll(".recharts-tooltip-item"))
              .map((item) => {
                const nameEl = item.querySelector(".recharts-tooltip-item-name")
                const valueEl = item.querySelector(".recharts-tooltip-item-value")
                return {
                  name: nameEl?.textContent || "",
                  value: valueEl?.textContent || "",
                  color: window.getComputedStyle(item).color,
                  dataKey: nameEl?.textContent?.toLowerCase() || "",
                }
              })
            setPayload(tipPayload)
          }
        }
      })

      observer.observe(tooltipWrapper, { attributes: true, childList: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [])

  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div ref={tooltipRef} className="space-y-1.5">
      {payload.map((item, index) => {
        const key = item.dataKey
        const color = config && key && config[key] ? 
          config[key].color : 
          item.color
        const label = config && key && config[key]?.label ?
          config[key].label :
          item.name

        return (
          <div
            key={index}
            className="flex items-center justify-between gap-2"
          >
            <div className={`flex items-center gap-1.5 tooltip-item-${indicator}`} style={{ "--dot-color": color }}>
              <span className="capitalize text-muted-foreground">{label}</span>
            </div>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
        )
      })}
    </div>
  )
}
