'use client';

import React, { useState } from 'react';
import LogTable from '@/app/(routes)/(dashboard)/logs/components/LogTable';
import LogFilter from '@/app/(routes)/(dashboard)/logs/components/LogFilter';
import { LogBarChart } from '@/app/(routes)/(dashboard)/logs/components/LogBarChart';
import { useLogs } from '@/hooks/useLogs';
import ErrorServer from '@/components/ErrorServer';
import LogTableSkeleton from '@/app/(routes)/(dashboard)/logs/components/LogTableSkeleton';

export default function Logs() {
    // Use the custom hook for logs
    const { logs, error, isLoading, isRefreshing, refreshLogs } = useLogs();
    // State for filters
    const [filters, setFilters] = useState({
        user: '',
        dateRange: '',
        ip: '',
        event: '',
        lab: ''
    });

    if (error) {
        return (
            <ErrorServer
                message="Error al cargar los registros de logs. Por favor, intente de nuevo."
                onRetry={refreshLogs}
            />
        );
    }

    if (isLoading) {
        return <LogTableSkeleton />;
    }

    // Filter logs based on selected filters
    const filteredLogs = logs.filter(log => {
        // User filter
        const userMatch = !filters.user || 
            (log.user && log.user.toLowerCase().includes(filters.user.toLowerCase()));
        
        // IP filter
        const ipMatch = !filters.ip || 
            (log.ip && log.ip.includes(filters.ip));
        
        // Event filter
        const eventMatch = !filters.event || 
            (log.event && log.event.toLowerCase() === filters.event.toLowerCase());
        
        // Lab filter
        const labMatch = !filters.lab || 
            (log.lab && log.lab.toLowerCase() === filters.lab.toLowerCase());
        
        // Date range filter
        const dateRangeMatch = !filters.dateRange || (
            filters.dateRange.from && 
            filters.dateRange.to &&
            log.dateObj >= new Date(filters.dateRange.from) &&
            log.dateObj <= new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
        );

        return userMatch && ipMatch && eventMatch && labMatch && dateRangeMatch;
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Registros de Actividad</h2>
            </div>
            <div className="space-y-4">
                <LogFilter logs={logs} filters={filters} setFilters={setFilters} />
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <LogBarChart logs={filteredLogs} />
                </div>
                
                <LogTable 
                    logs={filteredLogs} 
                    isRefreshing={isRefreshing} 
                    refreshLogs={refreshLogs} 
                />
            </div>
        </div>
    );
}