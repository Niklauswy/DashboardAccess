'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LogRow from "./LogRow";
import CustomPagination from "@/components/ui/CustomPagination";

const LogTable = ({ logs }) => {
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLogs, setCurrentLogs] = useState([]);
    const totalPages = Math.ceil(logs.length / pageSize);

    useEffect(() => {
        setCurrentLogs(logs.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        console.log('Current Logs:', logs.slice((currentPage - 1) * pageSize, currentPage * pageSize)); // Añadido para depuración
    }, [logs, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logs</CardTitle>
                <CardDescription>Conexiones y desconexiones de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Computadora</TableHead>
                            <TableHead>Laboratorio</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead>Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentLogs.map(log => <LogRow key={log.id} log={log} />)}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{currentLogs.length}</strong> de <strong>{logs.length}</strong> logs
                </div>
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </CardFooter>
        </Card>
    );
};

export default LogTable;