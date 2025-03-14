import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, ChevronDown, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateTimeDisplay } from '@/lib/date-utils';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from 'lucide-react';

export default function UserTableContent({
    columns,
    visibleColumns,
    paginatedUsers,
    selectedRows,
    toggleAllRows,
    toggleRow,
    handleSort,
    sortColumn,
    sortDirection,
    handleAction
}) {
    // Renderiza el valor de la celda según tipo
    const renderCellValue = (user, column) => {
        const value = user[column.name];
        
        switch (column.type) {
            case 'text':
                return value || '-';
                
            case 'boolean':
                return value ? <Check className="mx-auto h-4 w-4 text-green-600" /> : null;
                
            case 'date':
                return value ? <DateTimeDisplay dateInput={value} /> : '-';
                
            case 'badge':
                return value ? <Badge>{value}</Badge> : '-';
                
            case 'avatar':
                return (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{(user.name || user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                );
                
            case 'array':
                return Array.isArray(value) ? value.join(', ') : '-';
                
            default:
                return value || '-';
        }
    };

    return (
        <div className="rounded-lg border shadow overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={selectedRows.length === paginatedUsers.length && paginatedUsers.length > 0}
                                onCheckedChange={() => toggleAllRows(paginatedUsers)}
                                aria-label="Select all rows"
                            />
                        </TableHead>
                        {columns.filter((col) => visibleColumns.includes(col.key)).map((column) => (
                            <TableHead key={column.key}>
                                {column.sortable ? (
                                    <Button variant="ghost" className="hover:bg-gray-100 -ml-4 h-8" onClick={() => handleSort(column.key)}>
                                        {column.label}
                                        {sortColumn === column.key ? (
                                            sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                ) : (
                                    column.label
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.filter(col => visibleColumns.includes(col.key)).length + 1} className="text-center py-8">
                                No hay usuarios que coincidan con los filtros aplicados
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedUsers.map((user) => (
                            <TableRow key={user.username} className="hover:bg-gray-50">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(user.username)}
                                        onCheckedChange={() => toggleRow(user.username)}
                                        aria-label={`Select ${user.username}`}
                                    />
                                </TableCell>
                                {columns.filter((col) => visibleColumns.includes(col.key)).map((column) => (
                                    <TableCell key={column.key}>
                                        {column.key === "accion" ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleAction("edit", user.username)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleAction("delete", user.username)}>Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : column.key === "groups" ? (
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {user.groups?.map((group) => (
                                                    <Badge key={group} variant="secondary">
                                                        {group}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            renderCellValue(user, column)
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
