import useSWR from 'swr';

/**
 * Hook simplificado para obtener OUs y grupos, con caché optimizada
 */
export function useOusAndGroups() {
  // Fetcher común para ambas llamadas
  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error cargando datos de ${url}`);
    return res.json();
  };

  // Obtener OUs con caché de 10 minutos
  const { data: ous, error: ousError } = useSWR('/api/ous', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutos
  });

  // Obtener grupos con caché de 10 minutos
  const { data: groups, error: groupsError } = useSWR('/api/groups', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutos
  });
  
  return {
    ous: ous || [],
    groups: groups || [],
    isLoading: !ous || !groups,
    isError: ousError || groupsError
  };
}
