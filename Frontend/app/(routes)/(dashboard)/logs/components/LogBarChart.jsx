'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isValid, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LogBarChart({ logs }) {
  const [chartType, setChartType] = React.useState("daily");
  
  const chartData = React.useMemo(() => {
    if (!logs || !logs.length) return [];
    
    let groupedData = {};
    
    logs.forEach((log) => {
      try {
        if (!log.dateObj) return;
        
        let groupKey;
        
        switch(chartType) {
          case 'hourly':
            groupKey = format(log.dateObj, 'yyyy-MM-dd HH:00');
            break;
          case 'daily':
            groupKey = format(log.dateObj, 'yyyy-MM-dd');
            break;
          case 'monthly':
            groupKey = format(log.dateObj, 'yyyy-MM');
            break;
          default:
            groupKey = format(log.dateObj, 'yyyy-MM-dd');
        }
                
        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            date: groupKey,
            login: 0,
            logout: 0,
            total: 0
          };
        }
        
        // Increment specific event type counters
        const eventType = (log.event || '').toLowerCase();
        if (eventType.includes('login') || eventType.includes('ingreso')) {
          groupedData[groupKey].login += 1;
        } else if (eventType.includes('logout') || eventType.includes('salida')) {
          groupedData[groupKey].logout += 1;
        }
        
        // Always increment total
        groupedData[groupKey].total += 1;
      } catch (error) {
        console.error("Error processing log for chart:", error);
      }
    });
    
    // Convert to array and sort by date
    return Object.values(groupedData)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, chartType]);

  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      // Format based on chart type
      switch(chartType) {
        case 'hourly':
          return format(new Date(date), 'HH:00', { locale: es });
        case 'daily':
          return format(new Date(date), 'dd MMM', { locale: es });
        case 'monthly':
          return format(new Date(date + '-01'), 'MMM yyyy', { locale: es });
        default:
          return format(new Date(date), 'dd MMM', { locale: es });
      }
    } catch (e) {
      return date;
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Actividad de usuarios</CardTitle>
          <CardDescription>
            Registros de acceso al sistema
          </CardDescription>
        </div>
        <Select 
          value={chartType}
          onValueChange={setChartType}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Vista diaria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Por hora</SelectItem>
            <SelectItem value="daily">Por día</SelectItem>
            <SelectItem value="monthly">Por mes</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[300px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value, name) => [value, name === 'login' ? 'Ingresos' : name === 'logout' ? 'Salidas' : 'Total']}
                labelFormatter={formatDate}
              />
              <Bar 
                dataKey="login" 
                fill="hsl(142.1 76.2% 36.3%)" 
                name="Ingresos"
              />
              <Bar 
                dataKey="logout" 
                fill="hsl(47.9 95.8% 53.1%)" 
                name="Salidas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}