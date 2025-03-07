import useSWR from 'swr';

const fetcher = url => 
    fetch(url).then(res => {
        if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
        return res.json();
    });

/**
 * Hook para obtener OUs con caché optimizada
 */
export function useOus() {
    const { data, error, isLoading } = useSWR('/api/ous', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 600000, // 10 minutos
        keepPreviousData: true,
    });

    return {
        ous: data,
        isLoading,
        isError: error
    };
}

/**
 * Hook para obtener Grupos con caché optimizada
 */
export function useGroups() {
    const { data, error, isLoading } = useSWR('/api/groups', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 600000, // 10 minutos
        keepPreviousData: true,
    });

    return {
        groups: data,
        isLoading,
        isError: error
    };
}

/**
 * Hook combinado para obtener tanto OUs como Grupos en un solo hook
 */
export function useOusAndGroups() {
    const { ous, isLoading: ousLoading, isError: ousError } = useOus();
    const { groups, isLoading: groupsLoading, isError: groupsError } = useGroups();
    
    return {
        ous,
        groups,
        isLoading: ousLoading || groupsLoading,
        isError: ousError || groupsError
    };
}
