'use client';

import React, { useState, useEffect } from 'react';
import LogTable from '@/app/(routes)/(dashboard)/logs/components/LogTable';
import LogFilter from '@/app/(routes)/(dashboard)/logs/components/LogFilter';
import { LogBarChart } from '@/app/(routes)/(dashboard)/logs/components/LogBarChart';
import { useLogs } from '@/hooks/useLogs';
import ErrorServer from '@/components/ErrorServer';
import LogTableSkeleton from '@/app/(routes)/(dashboard)/logs/components/LogTableSkeleton';

export default function Logs() {
    // Use the custom hook for logs
    const { logs = [], error, isLoading, isRefreshing, refreshLogs } = useLogs();
    
    // Initialize filters with empty arrays
    const [filters, setFilters] = useState({
        users: [],
        ous: [],
        groups: [],
        events: [],
        labs: [],
        ip: '',
        dateRange: null
    });
    
    // Log some debug info when logs change
    useEffect(() => {
        if (logs && logs.length > 0) {
            console.log(`Got ${logs.length} logs`);
            console.log('First log:', logs[0]);
            
            // Check date objects
            const validDates = logs.filter(log => log.dateObj instanceof Date && !isNaN(log.dateObj));
            console.log(`Logs with valid dateObj: ${validDates.length} out of ${logs.length}`);
        }
    }, [logs]);

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

    // Filter logs based on the multi-selection filters
    const filteredLogs = logs.filter(log => {
        // User filter (any of the selected users)
        const userMatch = filters.users.length === 0 || 
            (log.user && filters.users.includes(log.user));
        
        // OU filter (any of the selected OUs)
        const ouMatch = filters.ous.length === 0 || 
            (log.ou && filters.ous.includes(log.ou));
            
        // Group filter (any of the selected groups)
        const groupMatch = filters.groups.length === 0 || 
            (log.groups && log.groups.some(group => filters.groups.includes(group)));
        
        // Event filter (any of the selected events)
        const eventMatch = filters.events.length === 0 || 
            (log.event && filters.events.includes(log.event));
        
        // Lab filter (any of the selected labs)
        const labMatch = filters.labs.length === 0 || 
            (log.lab && filters.labs.includes(log.lab));
        
        // IP filter (partial match)
        const ipMatch = !filters.ip || 
            (log.ip && log.ip.includes(filters.ip));
        
        // Date range filter - Ensure we have both from and to dates 
        // and that we have a valid dateObj to compare with
        const dateRangeMatch = !filters.dateRange || !filters.dateRange.from || !filters.dateRange.to || 
            !log.dateObj || (
                log.dateObj >= new Date(filters.dateRange.from) &&
                log.dateObj <= new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
            );

        return userMatch && ouMatch && groupMatch && eventMatch && labMatch && ipMatch && dateRangeMatch;
    });

    // Log filtering results
    console.log(`Filtered ${logs.length} logs down to ${filteredLogs.length}`);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
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