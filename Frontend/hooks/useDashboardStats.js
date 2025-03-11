import useSWR from 'swr';
import { useState } from 'react';

export function useDashboardStats() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, error, mutate } = useSWR(
    '/api/dashboard/stats',
    async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error cargando estadísticas del dashboard');
      return res.json();
    },
    {
      refreshInterval: 60000, // Actualizar cada minuto
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  // Función para actualizar manualmente
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    stats: stats || {
      activeSessions: 0,
      activeUsers: 0,
      activeComputers: 0,
      averageSessionTime: '0h 0m',
      hourlyActivity: [],
      osDistribution: [],
      topUsers: [],
      unusualIPs: [],
      recentActivity: [],
      sessionList: []
    },
    error,
    isLoading: !stats && !error,
    isRefreshing,
    refreshStats
  };
}
