'use client';

import useSWR from 'swr'; // Import useSWR
import UserTable from '@/components/UserTable';
import UserTableSkeleton from '@/components/UserTableSkeleton';

export default function UsersPage() {
    const fetcher = url => fetch(url, { cache: 'no-store' }).then(res => res.json());

    const { data: users, error, mutate } = useSWR('/api/users', fetcher, {
        refreshInterval: 0, // Disable automatic refresh
    });

    async function fetchUsersData() {
        await mutate(); // Manually trigger revalidation
    }

    if (error) {
        return <div>Error loading users</div>;
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
