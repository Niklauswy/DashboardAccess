"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  DownloadIcon,
  User,
  Server,
  Calendar,
  Activity,
  Link2,
  LogOut,
} from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/data-table/TablePagination";
import { Badge } from "@/components/ui/badge";
import { DateTimeDisplay, parseDate } from "@/lib/date-utils";

export default function LogTable({ logs, isRefreshing, refreshLogs }) {
  // Pre-procesar las fechas para el ordenamiento correcto
  const processedLogs = logs.map(log => ({
    ...log,
    // Agregar campo para ordenamiento
    sortDate: parseDate(log.date)?.getTime() || 0,
  }));

  // Use the pagination hook with processed logs
  const pagination = usePagination(processedLogs, {
    initialPage: 1,
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    sortKey: "sortDate", // Usar el nuevo campo para ordenamiento
    sortDirection: "desc",
  });

  // Function to render sorted column headers
  const renderSortableHeader = (key, label, icon) => (
    <TableHead
      onClick={() => pagination.requestSort(key)}
      className="cursor-pointer hover:bg-gray-100"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{label}</span>
        {pagination.sort.key === key ? (
          <span className="text-primary">
            {pagination.sort.direction === "asc" ? (
              <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </span>
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </TableHead>
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("es-ES");
    } catch (e) {
      return dateString;
    }
  };

  
  const getEventBadge = (event) => {
    if (!event) return <Badge variant="outline">Desconocido</Badge>;

    const lowerEvent = event.toLowerCase();

    if (lowerEvent === "disconnect") {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
        >
          <LogOut className="mr-1 h-3 w-3" />
          Desconexión
        </Badge>
      );
    }

    if (lowerEvent === "connect") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
        >
          <Link2 className="mr-1 h-3 w-3" />
          Conexión
        </Badge>
      );
    }

    return <Badge variant="outline">{event}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Registros de actividad</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLogs}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {renderSortableHeader(
                  "date",
                  "Fecha y Hora",
                  <Calendar className="h-4 w-4" />
                )}
                {renderSortableHeader(
                  "user",
                  "Usuario",
                  <User className="h-4 w-4" />
                )}
                {renderSortableHeader(
                  "event",
                  "Evento",
                  <Activity className="h-4 w-4" />
                )}
                {renderSortableHeader(
                  "lab",
                  "Laboratorio",
                  <Server className="h-4 w-4" />
                )}
                {renderSortableHeader("ip", "IP", null)}
                {renderSortableHeader("details", "Detalles", null)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No hay registros de logs para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                pagination.pageItems.map((log, index) => (
                  <TableRow key={`log-${index}`}>
                    <TableCell>
                      <DateTimeDisplay dateInput={log.date} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.user}</div>
                    </TableCell>
                    <TableCell>{getEventBadge(log.event)}</TableCell>
                    <TableCell>{log.lab}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{log.ip}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">
                        {log.details}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <TablePagination
            currentPage={pagination.currentPage}
            pageSize={pagination.pageSize}
            setCurrentPage={pagination.setCurrentPage}
            setPageSize={pagination.setPageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            pageSizeOptions={pagination.pageSizeOptions}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
