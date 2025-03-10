'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';

export function LogBarChart({ logs = [], filters }) {
  // Define time range options with JSX buttons instead of Select
  const [timeRange, setTimeRange] = React.useState("30d");
  
  // Define chart configuration
  const chartConfig = {
    login: {
      label: 'Ingresos',
      color: 'hsl(142.1 76.2% 36.3%)', // green
    },
    logout: {
      label: 'Salidas',
      color: 'hsl(47.9 95.8% 53.1%)', // yellow
    },
    failed: {
      label: 'Fallos',
      color: 'hsl(0, 84%, 60%)', // red
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
    
    // Fill in log counts
    logs.forEach(log => {
      if (!log.dateObj) return;
      
      // Only count logs within the selected date range
      if (log.dateObj < startDate || log.dateObj > endDate) return;
      
      const dateKey = format(log.dateObj, 'yyyy-MM-dd');
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: dateKey, login: 0, logout: 0, failed: 0 };
      }
      
      // Increment appropriate counter based on event type
      const eventType = (log.event || '').toLowerCase();
      if (eventType.includes('login') || eventType.includes('ingreso')) {
        dateGroups[dateKey].login++;
      } else if (eventType.includes('logout') || eventType.includes('salida')) {
        dateGroups[dateKey].logout++;
      } else if (eventType.includes('fail') || eventType.includes('error')) {
        dateGroups[dateKey].failed++;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, timeRange, filters?.dateRange]);

  // Don't show the time range buttons if date filter is active
  const isDateFilterActive = !!(filters?.dateRange?.from && filters?.dateRange?.to);

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="grid flex-1 gap-1">
          <CardTitle>Actividad de usuarios</CardTitle>
          <CardDescription>
            {isDateFilterActive 
              ? `Registros desde ${format(new Date(filters.dateRange.from), 'dd/MM/yyyy', { locale: es })} hasta ${format(new Date(filters.dateRange.to), 'dd/MM/yyyy', { locale: es })}`
              : 'Registros de acceso al sistema'}
          </CardDescription>
        </div>
        
        {/* JSX-based time range selector (only shown when date filter is not active) */}
        {!isDateFilterActive && (
          <div className="flex space-x-1">
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
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillLogin" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-login)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-login)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillLogout" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-logout)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-logout)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-failed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-failed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'dd MMMM yyyy', { locale: es });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="login"
                strokeWidth={2}
                stroke="var(--color-login)"
                fill="url(#fillLogin)"
                stackId="a"
              />
              <Area
                type="monotone"
                dataKey="logout"
                strokeWidth={2}
                stroke="var(--color-logout)" 
                fill="url(#fillLogout)"
                stackId="a"
              />
              <Area
                type="monotone"
                dataKey="failed"
                strokeWidth={2}
                stroke="var(--color-failed)"
                fill="url(#fillFailed)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
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




