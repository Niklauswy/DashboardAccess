'use client'
import { useState, useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ExportButton from '@/components/ExportButton';
import EditUserDialog from "@/components/EditUserDialog";

const careerIcons = {
    CC: <Cpu className="h-4 w-4" />,
    CDD: <Database className="h-4 w-4" />,
    MAT: <SquareFunction className="h-4 w-4" />,
    FIS: <Atom className="h-4 w-4" />,
    TCCE: <Beaker className="h-4 w-4" />,
    TCCN: <Leaf className="h-4 w-4" />,
    BIO: <Microscope className="h-4 w-4" />,
};

const columns = [
    { key: "username", label: "Usuario", fixed: true },
    { key: "name", label: "Nombre", fixed: true },
    { key: "ou", label: "Carrera" },
    { key: "logonCount", label: "Total Logs", sortable: true },
    { key: "lastLogon", label: "Último Inicio", sortable: true },
    { key: "groups", label: "Grupos", sortable: false }, // Asegurar que 'groups' no sea sortable si es necesario
    { key: "accion", label: "", fixed: true },
];

export default function UserTable({ users, refreshUsers }) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const sortedUsers = useMemo(() => {
        if (!sortColumn) return users;
        return [...users].sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [users, sortColumn, sortDirection]);

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return sortedUsers.slice(start, start + rowsPerPage);
    }, [sortedUsers, page, rowsPerPage]);

    const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);

    const toggleAllRows = useCallback(() => {
        if (selectedRows.length === paginatedUsers.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedUsers.map((user) => user.username));
        }
    }, [paginatedUsers, selectedRows]);

    const toggleRow = useCallback((id) => {
        setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
    }, []);

    const handleSort = useCallback((column) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }, [sortColumn]);

    const handleAction = useCallback((action, userId) => {
        const user = users.find(u => u.username === userId);
        switch (action) {
            case "edit":
                setCurrentUser(user);
                setEditDialogOpen(true);
                break;
            case "delete":
                setCurrentUser(user);
                setDeleteDialogOpen(true);
                break;
            default:
                break;
        }
    }, [users]);

    return (
        <div className="p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={selectedRows.length === paginatedUsers.length && paginatedUsers.length > 0}
                                onCheckedChange={toggleAllRows}
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
                    {paginatedUsers.map((user) => (
                        <TableRow key={user.username} className="hover:bg-gray-50">
                            <TableCell>
                                <Checkbox
                                    checked={selectedRows.includes(user.username)}
                                    onCheckedChange={() => toggleRow(user.username)}
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
                                                <DropdownMenuItem onSelect={() => handleAction("addLabel", user.username)}>Añadir Label</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : column.key === "groups" ? (
                                        user.groups?.map((group) => (
                                            <Badge key={group} variant="secondary" className="mr-1">
                                                {group}
                                            </Badge>
                                        ))
                                    ) : (
                                        user[column.key]
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{selectedRows.length} de {sortedUsers.length} usuarios seleccionados.</span>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                        <span>Usuarios por página</span>
                        <select
                            className="border rounded p-1"
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                        >
                            <option>20</option>
                            <option>50</option>
                            <option>100</option>
                        </select>
                        <span>Página {page} de {totalPages}</span>
                        <div className="space-x-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 rounded-full"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                            >
                                «
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 rounded-full"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                            >
                                ‹
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 rounded-full"
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                            >
                                ›
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 rounded-full"
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                            >

                                »
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <EditUserDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                currentUser={currentUser}
                onUpdate={() => {
                    setEditDialogOpen(false);
                    refreshUsers();
                }}
            />
        </div>
    );
}


