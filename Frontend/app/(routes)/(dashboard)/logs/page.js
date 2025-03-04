'use client';
import React, {useEffect, useState} from 'react';
import LogTable from '@/app/(routes)/(dashboard)/logs/components/LogTable';
import LogFilter from '@/app/(routes)/(dashboard)/logs/components/LogFiltrer';
import {LogBarChart} from '@/app/(routes)/(dashboard)/logs/components/LogBarChart';
import {parse} from 'date-fns';
import ErrorServer from '@/components/ErrorServer';
import NoData from '@/components/NoData';
import LogTableSkeleton from '@/app/(routes)/(dashboard)/logs/components/LogTableSkeleton';

export default function Logs() {
    const [filters, setFilters] = useState({user: '', dateRange: '', ip: '', event: ''});
    const [logs, setLogs] = useState([]);
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch('/api/logs', { // Cambiado a ruta relativa
                    cache: 'no-store',
                });
                if (!res.ok) {
                    throw new Error('Error fetching logs');
                }
                const data = await res.json();
                console.log('Fetched logs:', data); // Añadido para depuración
                setLogs(data);
                setServerError(null);
            } catch (error) {
                console.error('Error fetching logs:', error);
                setServerError(error.message);
            }
        }

        fetchLogs();
        const intervalId = setInterval(() => {
            fetchLogs();
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleRetry = () => {
        window.location.reload();
    };

    if (serverError) {
        return <ErrorServer message={serverError} onRetry={handleRetry} />;
    }

    if (!logs) {
        return <LogTableSkeleton />;
    }

    // Check if logs is an array and non-empty
    if (!Array.isArray(logs) || logs.length === 0) {
        return <NoData message="No se encontraron logs." />;
    }

    const filteredLogs = logs.filter(({user, ip, event, date}) => {
        const {user: filterUser, ip: filterIp, event: filterEvent, dateRange} = filters;

        const userMatch = !filterUser || user?.toLowerCase().includes(filterUser.toLowerCase());
        const ipMatch = !filterIp || ip?.includes(filterIp);
        const eventMatch = !filterEvent || event?.toLowerCase() === filterEvent.toLowerCase();

        const logDateObj = parse(date, 'yyyy MMM dd HH:mm:ss', new Date());

        const dateRangeMatch = !dateRange || (
            dateRange.from && dateRange.to &&
            logDateObj >= new Date(dateRange.from) &&
            logDateObj <= new Date(dateRange.to).setHours(23, 59, 59, 999)
        );

        return userMatch && ipMatch && eventMatch && dateRangeMatch;
    });

    console.log('Filtered logs:', filteredLogs); // Añadido para verificar logs filtrados

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="flex flex-col sm:gap-4 sm:py-4">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <LogFilter logs={logs} filters={filters} setFilters={setFilters}/>
                    <LogTable logs={filteredLogs}/>
                    <LogBarChart logs={filteredLogs}/>
                </main>
            </div>
        </div>
    );
}