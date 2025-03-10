'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';

export function LogBarChart({ logs = [], filters }) {
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

  // Process log data for the chart, tomando en cuenta el filtro de fecha si existe,
  // o usando un rango fijo de 30 días en caso contrario.
  const chartData = React.useMemo(() => {
    if (!logs?.length) return [];
    
    const today = new Date();
    let endDate = endOfDay(today);
    let startDate;

    // Si se aplica un filtro de fecha, se usan esas fechas
    if (filters?.dateRange?.from && filters?.dateRange?.to) {
      startDate = startOfDay(new Date(filters.dateRange.from));
      endDate = endOfDay(new Date(filters.dateRange.to));
    } else {
      // Rango fijo de 30 días
      startDate = startOfDay(subDays(today, 30));
    }
    
    // Agrupar logs por fecha
    const dateGroups = {};
    
    // Inicializar todas las fechas en el rango
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dateGroups[dateKey] = { date: dateKey, login: 0, logout: 0 };
      currentDate = addDays(currentDate, 1);
    }
    
    // Rellenar conteos de logs
    logs.forEach(log => {
      if (!log.dateObj) return;
      
      // Solo contar logs dentro del rango seleccionado
      if (log.dateObj < startDate || log.dateObj > endDate) return;
      
      const dateKey = format(log.dateObj, 'yyyy-MM-dd');
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: dateKey, login: 0, logout: 0 };
      }
      
      // Incrementar el contador correspondiente
      const eventType = (log.event || '').toLowerCase();
      if (eventType.includes('login') || eventType.includes('ingreso')) {
        dateGroups[dateKey].login++;
      } else if (eventType.includes('logout') || eventType.includes('salida')) {
        dateGroups[dateKey].logout++;
      }
    });
    
    // Convertir a array y ordenar por fecha
    return Object.values(dateGroups).sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, filters?.dateRange]);

  // Indica si se está utilizando un filtro por fecha
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
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No hay datos para el período seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}




