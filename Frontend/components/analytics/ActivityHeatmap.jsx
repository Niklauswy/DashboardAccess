"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityHeatmap({ title, data }) {
  // Group events by hour of day (0-23)
  const hourCounts = Array(24).fill(0);
  
  data.forEach(log => {
    try {
      const time = log.date.split(' ')[1];
      const hour = parseInt(time.split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    } catch (e) {
      // Skip invalid date formats
    }
  });
  
  // Find the max count for scaling
  const maxCount = Math.max(...hourCounts);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1 mb-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground">
              {i === 0 ? '12am' : `${i}am`}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-1 mb-4">
          {hourCounts.slice(0, 12).map((count, hour) => {
            const intensity = count > 0 ? Math.max(0.2, count / maxCount) : 0;
            return (
              <div 
                key={hour} 
                className="h-8 rounded" 
                style={{ 
                  backgroundColor: `rgba(37, 99, 235, ${intensity})`,
                  transition: 'background-color 0.2s'
                }}
                title={`${count} events at ${hour === 0 ? '12am' : `${hour}am`}`}
              />
            );
          })}
        </div>
        
        <div className="grid grid-cols-12 gap-1 mb-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground">
              {i === 0 ? '12pm' : `${i}pm`}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-1">
          {hourCounts.slice(12, 24).map((count, idx) => {
            const hour = idx + 12;
            const intensity = count > 0 ? Math.max(0.2, count / maxCount) : 0;
            return (
              <div 
                key={hour} 
                className="h-8 rounded" 
                style={{ 
                  backgroundColor: `rgba(37, 99, 235, ${intensity})`,
                  transition: 'background-color 0.2s'
                }}
                title={`${count} events at ${hour === 12 ? '12pm' : `${hour - 12}pm`}`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
