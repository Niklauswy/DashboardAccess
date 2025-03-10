'use client';

import React from 'react';
import { useUsers } from '@/hooks/useUsers';
import UserTableSkeleton from '@/components/skeletons/UserTableSkeleton';
import ErrorServer from '@/components/ErrorServer';
import UsersByViews from '../components/UsersByViews';

export default function UserDashboardPage() {
    const { 
        users,
        error, 
        isLoading, 
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
            <h2 className="text-3xl font-bold tracking-tight">Panel de Usuarios</h2>
            <p className="text-muted-foreground">Visualiza los usuarios por grupos y carreras.</p>
            
            <UsersByViews users={users} />
        </div>
    );
}
