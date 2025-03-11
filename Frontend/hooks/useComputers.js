import useSWR from 'swr';
import { useState } from 'react';

export function useComputers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch computers with SWR for caching and revalidation
  const { data: computersData, error, mutate } = useSWR(
    '/api/computers',
    async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error cargando computadoras');
      
      const data = await res.json();
      
      // Process the data to create a flat array of computers with location data
      const flatComputers = [];
      Object.entries(data).forEach(([location, computers]) => {
        computers.forEach(computer => {
          flatComputers.push({
            ...computer,
            location
          });
        });
      });
      
      return {
        grouped: data,
        flat: flatComputers
      };
    },
    {
      refreshInterval: 60000, // Auto refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  // Function to manually refresh computers
  const refreshComputers = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    computers: computersData?.flat || [],
    groupedComputers: computersData?.grouped || {},
    error,
    isLoading: !computersData && !error,
    isRefreshing,
    refreshComputers
  };
}
