import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { parse, format, addDays } from 'date-fns';

const chartConfig = {
  logs: {
    label: 'Logs',
    color: 'hsl(var(--chart-2))',
  },
};

const calculateLogsPerDay = (logs) => {
  const logsPerDay = {};

  logs.forEach((log) => {
    const logDateObj = parse(log.date, 'yyyy MMM dd HH:mm:ss', new Date());
    const correctedDate = addDays(logDateObj, 1); // Correct the date by adding one day
    const date = format(correctedDate, 'yyyy-MM-dd'); // Format to ISO date string (yyyy-MM-dd)
    if (!logsPerDay[date]) {
      logsPerDay[date] = 0;
    }
    logsPerDay[date]++;
  });

  const sortedDates = Object.keys(logsPerDay).sort((a, b) => new Date(a) - new Date(b));
  return sortedDates.map((date) => ({
    date,
    logs: logsPerDay[date],
  }));
};

export function LogBarChart({ logs }) {
  const chartData = React.useMemo(() => calculateLogsPerDay(logs), [logs]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Historic</CardTitle>
          <CardDescription>
            Showing total logs per day
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
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
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="logs"
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            <Bar dataKey="logs" fill={`var(--color-logs)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}