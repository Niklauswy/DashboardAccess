"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function LogBarChart({ logs = [], filters }) {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [activeChart, setActiveChart] = React.useState("login");

  // Define chart configuration
  const chartConfig = {
    views: {
      label: "Eventos",
    },
    login: {
      label: "Ingresos",
      color: "hsl(142.1 76.2% 36.3%)", // green
    },
    logout: {
      label: "Salidas",
      color: "hsl(47.9 95.8% 53.1%)", // yellow
    },
    failed: {
      label: "Fallos",
      color: "hsl(0, 84%, 60%)", // red
    }
  };

  // Process log data for the chart
  const { chartData, total } = React.useMemo(() => {
    console.log(`Processing ${logs?.length || 0} logs for chart, with timeRange: ${timeRange}`);
    
    if (!logs?.length) return { chartData: [], total: { login: 0, logout: 0, failed: 0 } };
    
    // Get date range based on selected timeRange or filter dates
    const today = new Date();
    let endDate = endOfDay(today);
    let startDate;

    // If dateRange filter is set, use those dates
    if (filters?.dateRange?.from && filters?.dateRange?.to) {
      startDate = startOfDay(new Date(filters.dateRange.from));
      endDate = endOfDay(new Date(filters.dateRange.to));
    } else {
      // Otherwise use the timeRange buttons
      switch(timeRange) {
        case "7d":
          startDate = startOfDay(subDays(today, 7));
          break;
        case "14d":
          startDate = startOfDay(subDays(today, 14));
          break;
        case "30d":
          startDate = startOfDay(subDays(today, 30));
          break;
        case "90d":
          startDate = startOfDay(subDays(today, 90));
          break;
        default:
          startDate = startOfDay(subDays(today, 30));
      }
    }
    
    console.log(`Chart date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Group logs by date
    const dateGroups = {};
    
    // Initialize all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dateGroups[dateKey] = { 
        date: dateKey, 
        login: 0, 
        logout: 0,
        failed: 0 
      };
      currentDate = addDays(currentDate, 1);
    }
    
    // Counters for totals
    let totalLogin = 0;
    let totalLogout = 0;
    let totalFailed = 0;
    
    // Fill in log counts
    logs.forEach(log => {
      if (!log.dateObj) {
        console.log("Log without dateObj:", log);
        return;
      }
      
      // Only count logs within the selected date range
      if (log.dateObj < startDate || log.dateObj > endDate) return;
      
      const dateKey = format(log.dateObj, 'yyyy-MM-dd');
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: dateKey, login: 0, logout: 0, failed: 0 };
      }
      
      // Increment appropriate counter based on event type
      const eventType = (log.event || '').toLowerCase();
      
      // Add "connect" to the login types
      if (eventType.includes('login') || eventType.includes('ingreso') || eventType.includes('connect')) {
        dateGroups[dateKey].login++;
        totalLogin++;
        console.log(`Login event: ${eventType} on ${dateKey}`);
      } else if (eventType.includes('logout') || eventType.includes('salida')) {
        dateGroups[dateKey].logout++;
        totalLogout++;
      } else if (eventType.includes('fail') || eventType.includes('error')) {
        dateGroups[dateKey].failed++;
        totalFailed++;
      } else {
        console.log(`Unrecognized event type: "${eventType}"`);
      }
    });
    
    // Convert to array and sort by date
    const data = Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`Generated ${data.length} chart data points with ${totalLogin} logins`);
    
    return { 
      chartData: data,
      total: {
        login: totalLogin,
        logout: totalLogout,
        failed: totalFailed
      }
    };
  }, [logs, timeRange, filters?.dateRange]);

  // Don't show the time range buttons if date filter is active
  const isDateFilterActive = !!(filters?.dateRange?.from && filters?.dateRange?.to);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>
            {isDateFilterActive 
              ? `Registros desde ${format(new Date(filters.dateRange.from), 'dd/MM/yyyy', { locale: es })} hasta ${format(new Date(filters.dateRange.to), 'dd/MM/yyyy', { locale: es })}`
              : 'Actividad de usuarios'}
          </CardTitle>
          <CardDescription>
            Registros de acceso al sistema
          </CardDescription>
        </div>
        
        {/* Column display buttons */}
        <div className="flex">
          {["login", "logout"].map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      
      {!isDateFilterActive && (
        <div className="flex justify-center gap-2 pt-4">
          <Button 
            variant={timeRange === "7d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("7d")}
          >
            7 días
          </Button>
          <Button 
            variant={timeRange === "14d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("14d")}
          >
            14 días
          </Button>
          <Button 
            variant={timeRange === "30d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("30d")}
          >
            30 días
          </Button>
          <Button 
            variant={timeRange === "90d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("90d")}
          >
            90 días
          </Button>
        </div>
      )}
      
      <CardContent className="px-2 sm:p-6">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return format(date, 'dd MMM', { locale: es });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return format(new Date(value), 'dd MMMM yyyy', { locale: es });
                    }}
                    valueFormatter={(value) => value}
                  />
                }
              />
              <Bar 
                dataKey={activeChart} 
                fill={`var(--color-${activeChart})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No hay datos para el período seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}




