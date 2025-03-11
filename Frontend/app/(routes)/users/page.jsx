'use client'
import UserTable from '@/app/(routes)/users/components/UserTable';
import UserTableSkeleton from '@/components/skeletons/UserTableSkeleton';
import ErrorServer from '@/components/ErrorServer';
import { useUsers } from '@/hooks/useUsers';

export default function UsersPage() {
    const { 
        users,
        error, 
        isLoading, 
        isRefreshing,
        refreshUsers 
    } = useUsers();

    if (error) {
        return (
            <ErrorServer
                message="Error al cargar los usuarios, parece ser un error del servidor"
                onRetry={refreshUsers}
            />
        );
    }

    if (isLoading) {
        return <UserTableSkeleton />;
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <UserTable 
                users={users} 
                refreshUsers={refreshUsers} 
                isRefreshing={isRefreshing} 
            />
        </div>
    );
}