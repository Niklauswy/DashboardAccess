'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';

export function LogBarChart({ logs }) {
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
  };

  // Process log data for the chart
  const chartData = React.useMemo(() => {
    if (!logs?.length) return [];
    
    // Get date range based on selected timeRange
    const today = new Date();
    const endDate = endOfDay(today);
    let startDate;
    
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
    
    // Group logs by date
    const dateGroups = {};
    
    // Initialize all dates in the range
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dateGroups[dateKey] = { date: dateKey, login: 0, logout: 0 };
      currentDate = addDays(currentDate, 1);
    }
    
    // Fill in log counts
    logs.forEach(log => {
      if (!log.dateObj) return;
      
      // Only count logs within the selected date range
      if (log.dateObj < startDate || log.dateObj > endDate) return;
      
      const dateKey = format(log.dateObj, 'yyyy-MM-dd');
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: dateKey, login: 0, logout: 0 };
      }
      
      // Increment appropriate counter
      const eventType = (log.event || '').toLowerCase();
      if (eventType.includes('login') || eventType.includes('ingreso')) {
        dateGroups[dateKey].login++;
      } else if (eventType.includes('logout') || eventType.includes('salida')) {
        dateGroups[dateKey].logout++;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, timeRange]);

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="grid flex-1 gap-1">
          <CardTitle>Actividad de usuarios</CardTitle>
          <CardDescription>
            Registros de acceso al sistema
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Últimos 30 días" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="14d">Últimos 14 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
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
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}