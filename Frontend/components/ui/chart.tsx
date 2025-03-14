"use client"

import * as React from "react"
import {type Color} from "react-colorful"
import {TooltipProps} from "recharts"

export interface ChartConfig {
  [key: string]: {
    label?: string
    color: Color
  }
}

interface ChartContextProps {
  config?: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps>({})

interface ChartProviderProps {
  config?: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({
  config,
  children,
  className,
}: ChartProviderProps & { className?: string }) {
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
}: TooltipProps<any, any> & { children?: React.ReactNode }) {
  const content = children || <ChartTooltipContent />
  return <Tooltip content={content} {...props} />
}

interface TooltipProps extends TooltipProps<any, any> {
  content: React.ReactNode
}

function Tooltip({ active, payload, content }: TooltipProps) {
  if (!active || !payload) {
    return null
  }

  return <div className="tooltip-container">{content}</div>
}

export function ChartTooltipContent({
  indicator = "dot",
}: { indicator?: "dot" | "line" } = {}) {
  const { config } = React.useContext(ChartContext)
  const ref = React.useRef<HTMLDivElement>(null)
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
}: {
  config?: ChartConfig
  indicator: "dot" | "line"
}) {
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const [payload, setPayload] = React.useState<any[] | null>(null)

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
            <div className={`flex items-center gap-1.5 tooltip-item-${indicator}`} style={{ "--dot-color": color } as React.CSSProperties}>
              <span className="capitalize text-muted-foreground">{label}</span>
            </div>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
        )
      })}
    </div>
  )
}
