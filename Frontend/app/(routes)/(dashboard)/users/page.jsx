'use client';

import useSWR from 'swr';
import UserTable from '@/components/UserTable';
import UserTableSkeleton from '@/components/UserTableSkeleton';
import ErrorServer from '@/components/ErrorServer';
import NoData from '@/components/NoData';

export default function UsersPage() {
    const fetcher = url => fetch(url, { cache: 'no-store' }).then(res => res.json());

    const { data: users, error, mutate } = useSWR('/api/users', fetcher, {
        refreshInterval: 0, // Disable automatic refresh
    });

    async function fetchUsersData() {
        await mutate();
    }

    if (error) {
        return <ErrorServer message="Error al cargar 
        los usuarios, parece ser un error del servidor" onRetry={fetchUsersData} />;
    }

    if (!users) {
        return <UserTableSkeleton />;
    }

  

    return (
        <div>
            <UserTable users={users} refreshUsers={fetchUsersData} />
        </div>
    );
}
