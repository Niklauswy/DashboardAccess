import useSWR from 'swr';
import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
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
      return data.map(log => ({
        ...log,
        formattedDate: formatLogDate(log.date),
        dateObj: parseLogDate(log.date),
        // Add a unique ID if none exists
        id: log.id || `${log.user}-${log.date}-${Math.random().toString(36).substr(2, 9)}`
      }));
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
  
  // Helper function to handle date parsing with consistent format
  function parseLogDate(dateString) {
    try {
      // Try parsing with format from backend
      const date = new Date(dateString);
      if (isValid(date)) return date;
      
      // Fallback formats for backward compatibility
      const formats = [
        'yyyy MMM dd HH:mm:ss', 
        'dd/MM/yyyy HH:mm:ss',
        'yyyy-MM-dd HH:mm:ss'
      ];
      
      for (const formatStr of formats) {
        try {
          const parsedDate = parseISO(dateString);
          if (isValid(parsedDate)) return parsedDate;
        } catch (e) {
          console.debug('Date parse attempt failed:', e);
        }
      }
      
      // Return current date as fallback
      return new Date();
    } catch (e) {
      console.error('Error parsing date:', e);
      return new Date();
    }
  }
  
  // Helper function to format dates consistently
  function formatLogDate(dateString) {
    try {
      const date = parseLogDate(dateString);
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch (e) {
      return dateString;
    }
  }

  return {
    logs,
    error,
    isLoading: !logs && !error,
    isRefreshing,
    refreshLogs,
    parseLogDate,
    formatLogDate
  };
}
