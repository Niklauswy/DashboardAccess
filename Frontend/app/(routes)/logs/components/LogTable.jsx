'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import CustomPagination from "@/components/ui/CustomPagination";
import LogRow from "./LogRow";

const LogTable = ({ logs, isRefreshing, refreshLogs }) => {
    const pageSize = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLogs, setCurrentLogs] = useState([]);
    const totalPages = Math.ceil(logs.length / pageSize);

    // Actualizar logs cuando se refresca la tabla
    useEffect(() => {
        setCurrentLogs(logs.slice((currentPage - 1) * pageSize, currentPage * pageSize));
    }, [logs, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top cuando se cambia de página
        const tableElement = document.getElementById('log-table');
        if (tableElement) tableElement.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Logs</CardTitle>
                    <CardDescription>Conexiones y acciones de usuarios</CardDescription>
                </div>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={refreshLogs} 
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="sr-only">Actualizar</span>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table id="log-table">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Computadora</TableHead>
                                <TableHead>Laboratorio</TableHead>
                                <TableHead>Evento</TableHead>
                                <TableHead className="text-right">Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentLogs.length > 0 ? (
                                currentLogs.map((log, index) => <LogRow key={log.id} log={log} index={index} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No hay logs para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{currentLogs.length}</strong> de <strong>{logs.length}</strong> logs
                </div>
                {logs.length > 0 && (
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </CardFooter>
        </Card>
    );
};

export default LogTable;