"use client";

import * as React from "react";
import { Bar, BarChart, XAxis, CartesianGrid } from "recharts";
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

  // Define chart configuration
  const chartConfig = {
    connect: {
      label: "Conexiones",
      color: "hsl(142.1 76.2% 36.3%)", // green
    },
    disconnect: {
      label: "Desconexiones",
      color: "hsl(47.9 95.8% 53.1%)", // yellow
    },
    failed: {
      label: "Fallos",
      color: "hsl(0, 84%, 60%)", // red
    }
  };

  // Process log data for the chart
  const chartData = React.useMemo(() => {
    if (!logs?.length) return [];
    
    // Get date range based on selected timeRange or filter dates
    const today = new Date();
    let endDate = endOfDay(today);
    let startDate;

    // If dateRange filter is set, use those dates
    if (filters?.dateRange?.from && filters?.dateRange?.to) {
      startDate = startOfDay(new Date(filters.dateRange.from));
      endDate = endOfDay(new Date(filters.dateRange.to));
      // Disable timeRange filter when a date range is active
      if (timeRange !== "") setTimeRange("");
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
        default:
          startDate = startOfDay(subDays(today, 30));
          break;
      }
    }
    
    // Group logs by date
    const dateGroups = {};
    
    // Initialize all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dateGroups[dateKey] = { 
        date: dateKey, 
        connect: 0, 
        disconnect: 0,
        failed: 0 
      };
      currentDate = addDays(currentDate, 1);
    }
    
    // Fill in log counts
    logs.forEach(log => {
      if (!log.dateObj) return;
      
      // Only count logs within the selected date range
      if (log.dateObj < startDate || log.dateObj > endDate) return;
      
      const dateKey = format(log.dateObj, 'yyyy-MM-dd');
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: dateKey, connect: 0, disconnect: 0, failed: 0 };
      }
      
      // Fix event type classification
      const eventType = (log.event || '').toLowerCase();
      if (eventType.includes('connect') || eventType.includes('ingreso') || eventType.includes('login')) {
        dateGroups[dateKey].connect++;
      } else if (eventType.includes('disconnect') || eventType.includes('salida') || eventType.includes('logout')) {
        dateGroups[dateKey].disconnect++;
      } else if (eventType.includes('fail') || eventType.includes('error')) {
        dateGroups[dateKey].failed++;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, timeRange, filters?.dateRange]);

  // Calculate totals
  const totals = React.useMemo(() => {
    let totalConnect = 0;
    let totalDisconnect = 0;
    
    chartData.forEach(day => {
      totalConnect += day.connect || 0;
      totalDisconnect += day.disconnect || 0;
    });
    
    return { connect: totalConnect, disconnect: totalDisconnect };
  }, [chartData]);

  // Don't show the time range buttons if date filter is active
  const isDateFilterActive = !!(filters?.dateRange?.from && filters?.dateRange?.to);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="grid flex-1 gap-1">
          <CardTitle>Actividad de usuarios</CardTitle>
          <CardDescription>
            {isDateFilterActive 
              ? `Registros desde ${format(new Date(filters.dateRange.from), 'dd/MM/yyyy', { locale: es })} hasta ${format(new Date(filters.dateRange.to), 'dd/MM/yyyy', { locale: es })}`
              : 'Registros de acceso al sistema'}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-sm bg-[hsl(142.1_76.2%_36.3%)]"></div>
            <span className="text-xs text-muted-foreground">Conexiones: {totals.connect}</span>
          </div>
          <div className="ml-4 flex items-center space-x-1">
            <div className="h-3 w-3 rounded-sm bg-[hsl(47.9_95.8%_53.1%)]"></div>
            <span className="text-xs text-muted-foreground">Desconexiones: {totals.disconnect}</span>
          </div>
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
                top: 10,
                right: 10,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={30}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return format(date, 'dd MMM', { locale: es });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return format(new Date(value), 'EEEE, dd MMMM yyyy', { locale: es });
                    }}
                  />
                }
              />
              <Bar 
                dataKey="connect" 
                stackId="a"
                fill="var(--color-connect)" 
                radius={[0, 0, 4, 4]}
              />
              <Bar 
                dataKey="disconnect" 
                stackId="a"
                fill="var(--color-disconnect)" 
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




