'use client'
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import UserTable from '@/components/UserTable';
import UserTableSkeleton from '@/components/skeletons/UserTableSkeleton';
import ErrorServer from '@/components/ErrorServer';

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
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <UserTable 
                users={users} 
                refreshUsers={fetchUsersData} 
                isRefreshing={isRefreshing} 
            />
        </div>
    );
}