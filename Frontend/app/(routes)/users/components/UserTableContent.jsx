import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
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
                            <React.Fragment key={user.username}>
                                <UserRow 
                                    user={user} 
                                    onEdit={() => handleAction("edit", user.username)}
                                    selected={selectedRows.includes(user.username)}
                                    onToggleSelect={() => toggleRow(user.username)}
                                />
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
