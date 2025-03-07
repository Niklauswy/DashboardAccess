'use client'
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import UserTable from '@/components/UserTable';
import UserTableSkeleton from '@/components/skeletons/UserTableSkeleton';
import ErrorServer from '@/components/ErrorServer';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function UsersPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const fetcher = url =>
        fetch(url, { cache: 'no-store' }).then(res => {
            if (!res.ok) throw new Error('Error loading users');
            return res.json();
        });

    const { data: users, error, mutate, isValidating } = useSWR('/api/users', fetcher, {
        refreshInterval: 0,
        revalidateOnFocus: false,
        dedupingInterval: 10000,
    });

    async function fetchUsersData() {
        setIsRefreshing(true);
        try {
            await mutate();
        } finally {
            setIsRefreshing(false);
        }
    }
    
    // Reset refresh state when validation completes
    useEffect(() => {
        if (!isValidating && isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidating, isRefreshing]);

    if (error) {
        return (
            <ErrorServer
                message="Error al cargar los usuarios, parece ser un error del servidor"
                onRetry={fetchUsersData}
            />
        );
    }

    if (!users) {
        return <UserTableSkeleton />;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <Button 
                    variant="outline" 
                    onClick={fetchUsersData} 
                    disabled={isRefreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>
            <UserTable users={users} refreshUsers={fetchUsersData} />
        </div>
    );
}