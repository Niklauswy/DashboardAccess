import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
    Button,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/button";
import { Pencil, Trash2, Check, ChevronDown, MoreVertical, ArrowUpDown } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getDateTimeDisplay } from '@/lib/date-utils';

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
    // Renderiza el encabezado de columna con indicador de ordenación
    const renderSortableHeader = (column) => (
        <div
            className="flex items-center cursor-pointer"
            onClick={() => handleSort(column.name)}
        >
            {column.label}
            {sortColumn === column.name ? (
                <ChevronDown 
                    className={`ml-1 h-4 w-4 transition-transform ${
                        sortDirection === 'asc' ? 'transform rotate-180' : ''
                    }`} 
                />
            ) : (
                <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100" />
            )}
        </div>
    );

    // Renderiza el valor de la celda según tipo
    const renderCellValue = (user, column) => {
        const value = user[column.name];
        
        switch (column.type) {
            case 'text':
                return value || '-';
                
            case 'boolean':
                return value ? <Check className="mx-auto h-4 w-4 text-green-600" /> : null;
                
            case 'date':
                return value ? getDateTimeDisplay(value).render : '-';
                
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
        <div className="rounded-md border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent group">
                        <TableHead className="w-12">
                            <Checkbox
                                checked={paginatedUsers.length > 0 && selectedRows.length === paginatedUsers.length}
                                onCheckedChange={() => toggleAllRows(paginatedUsers.map(user => user.username))}
                                aria-label="Select all"
                                className="translate-y-[2px]"
                            />
                        </TableHead>
                        
                        {columns
                            .filter(column => visibleColumns.includes(column.name))
                            .map(column => (
                                <TableHead 
                                    key={column.name}
                                    className="group"
                                >
                                    {renderSortableHeader(column)}
                                </TableHead>
                            ))
                        }
                        
                        <TableHead className="w-16 text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={visibleColumns.length + 2} className="h-24 text-center">
                                No se encontraron usuarios
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedUsers.map(user => (
                            <TableRow
                                key={user.username}
                                data-state={selectedRows.includes(user.username) ? "selected" : undefined}
                                className="group"
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(user.username)}
                                        onCheckedChange={() => toggleRow(user.username)}
                                        aria-label={`Seleccionar ${user.username}`}
                                        className="translate-y-[2px]"
                                    />
                                </TableCell>
                                
                                {columns
                                    .filter(column => visibleColumns.includes(column.name))
                                    .map(column => (
                                        <TableCell key={`${user.username}-${column.name}`}>
                                            {renderCellValue(user, column)}
                                        </TableCell>
                                    ))
                                }
                                
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem 
                                                onClick={() => handleAction('edit', user.username)}
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Editar</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleAction('delete', user.username)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Eliminar</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
