import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {ArrowDown, ArrowUp, ChevronDown} from "lucide-react";
import UserRow from './UserRow';

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
    // Esta función renderiza cada fila personalizada, según las columnas visibles
    const renderUserRow = (user) => {
        // Solo necesitamos pasar las columnas visibles al componente UserRow
        return (
            <UserRow 
                key={user.username}
                user={user} 
                visibleColumns={visibleColumns} // Pasamos las columnas visibles
                columns={columns}  // Pasamos todas las columnas para referencia
                onEdit={() => handleAction("edit", user.username)}
                selected={selectedRows.includes(user.username)}
                onToggleSelect={() => toggleRow(user.username)}
            />
        );
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
                        {/* Solo mostrar los encabezados de columnas visibles */}
                        {columns
                            .filter((col) => visibleColumns.includes(col.key))
                            .map((column) => (
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
                            ))
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={visibleColumns.length + 1} className="text-center py-8">
                                No hay usuarios que coincidan con los filtros aplicados
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedUsers.map(user => renderUserRow(user))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
