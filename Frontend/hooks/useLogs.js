import useSWR from 'swr';
import { useState } from 'react';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function useLogs() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch logs with SWR for caching and revalidation
  const { data: logs, error, mutate } = useSWR(
    '/api/logs',
    async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error cargando logs');
      
      const data = await res.json();
      
      // Process and standardize dates
      return data.map(log => {
        // Create a valid date object from the log date string
        const dateObj = parseLogDate(log.date);

        return {
          ...log,
          formattedDate: formatLogDate(dateObj),
          dateObj: dateObj,
          id: log.id || `${log.user}-${log.date}-${Math.random().toString(36).substring(2, 11)}`        };
      });
    },
    {
      refreshInterval: 30000, // Auto refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  // Function to manually refresh logs
  const refreshLogs = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  function parseLogDate(dateString) {
    if (!dateString) return new Date();
    
    try {
      // Try common date formats from most specific to least
      
      // Format: "2024 Mar 15 12:34:56" (from perl script)
      if (dateString.match(/^\d{4}\s+\w{3}\s+\d{1,2}\s+\d{1,2}:\d{2}:\d{2}$/)) {
        const [year, month, day, time] = dateString.split(' ');
        const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const [hour, min, sec] = time.split(':').map(Number);
        
        return new Date(parseInt(year), monthMap[month], parseInt(day), hour, min, sec);
      }
      
      // Format: "DD/MM/YYYY HH:MM:SS"
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/)) {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, min, sec] = timePart.split(':').map(Number);
        
        return new Date(year, month - 1, day, hour, min, sec);
      }
      
      // Simple format: try standard JS Date parsing
      const jsDate = new Date(dateString);
      if (isValid(jsDate)) {
        return jsDate;
      }
      
      console.warn('Failed to parse date:', dateString);
      return new Date(); // Fallback to current date
    } catch (e) {
      console.error('Date parsing error:', e);
      return new Date();
    }
  }
  
  // Helper function to format dates consistently
  function formatLogDate(dateObj) {
    try {
      return format(dateObj, 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  }

  return {
    logs: logs || [],
    error,
    isLoading: !logs && !error,
    isRefreshing,
    refreshLogs,
    parseLogDate,
    formatLogDate
  };
}
