'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LogTable from '@/app/(routes)/logs/components/LogTable';
import LogFilter from '@/app/(routes)/logs/components/LogFilter';
import { LogBarChart } from '@/app/(routes)/logs/components/LogBarChart';
import { useLogs } from '@/hooks/useLogs';
import ErrorServer from '@/components/ErrorServer';
import LogTableSkeleton from '@/app/(routes)/logs/components/LogTableSkeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function Logs() {
    // Use the custom hook for logs
    const { logs = [], error, isLoading, isRefreshing, refreshLogs } = useLogs();
    
    // Initialize filters with empty arrays
    const [filters, setFilters] = useState({
        users: [],
        labs: [],
        events: [],
        ip: '',
        dateRange: null
    });
    
    // Filter logs based on the multi-selection filters
    // IMPORTANT: All hooks must be declared before any conditional returns
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // User filter (any of the selected users)
            const userMatch = filters.users.length === 0 || 
                (log.user && filters.users.includes(log.user));
            
            // Lab filter (any of the selected labs)
            const labMatch = filters.labs.length === 0 || 
                (log.lab && filters.labs.includes(log.lab));
            
            // Event filter (any of the selected events)
            const eventMatch = filters.events.length === 0 || 
                (log.event && filters.events.includes(log.event));
            
            // IP filter (partial match)
            const ipMatch = !filters.ip || 
                (log.ip && log.ip.toLowerCase().includes(filters.ip.toLowerCase()));
            
            // Date range filter
            const dateRangeMatch = !filters.dateRange || !filters.dateRange.from || !filters.dateRange.to || 
                !log.dateObj || (
                    log.dateObj >= new Date(filters.dateRange.from) &&
                    log.dateObj <= new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
                );

            return userMatch && labMatch && eventMatch && ipMatch && dateRangeMatch;
        });
    }, [logs, filters]);
    
    // Log some debug info when logs change
    useEffect(() => {
        if (logs && logs.length > 0) {
            console.log(`Got ${logs.length} logs`);
        }
    }, [logs]);

    // Only return after all hooks have been called
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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">System Logs</h1>
                <Link href="/logs/sessions">
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                        <Users className="mr-2 h-4 w-4" />
                        Active Sessions
                    </Button>
                </Link>
            </div>
            <div className="space-y-4">
                <LogFilter logs={logs} filters={filters} setFilters={setFilters} />
                
                <LogBarChart logs={filteredLogs} filters={filters} />
                
                <LogTable 
                    logs={filteredLogs} 
                    isRefreshing={isRefreshing} 
                    refreshLogs={refreshLogs} 
                />
            </div>
        </div>
    );
}