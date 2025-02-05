'use client'
import { useState, useMemo, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    Check,
    X,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Filter,
    Eye,
    Cpu,
    SquareFunction,
    Atom,
    Microscope,
} from "lucide-react";
import { Monitor, Database, Beaker, Leaf } from "lucide-react";
import ExportButton from '@/components/ExportButton';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast"
import AddUserForm from "@/components/AddUserForm";
import { classNames } from "@/lib/utils"; // si ya tienes una función para combinar clases

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
    const { toast } = useToast()
    const [filter, setFilter] = useState("");
    const [selectedCarreras, setSelectedCarreras] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function fetchOus() {
            const res = await fetch('/api/ous');
            const data = await res.json();
            setOus(data);
        }
        async function fetchGroups() {
            const res = await fetch('/api/groups');
            const data = await res.json();
            setGroups(data);
        }
        fetchOus();
        fetchGroups();
    }, []);

    const allCarreras = useMemo(() => [
        ...new Set(Array.isArray(users) ? users.map((user) => user.ou).filter((ou) => ou) : [])
    ], [users]);

    const allGroups = useMemo(() => {
        const groups = Array.isArray(users) ? users.flatMap(user => user.groups) : [];
        return [...new Set(groups)];
    }, [users]);

    // Compute filtered users based on selected filters
    const filteredUsers = useMemo(() => {
        return Array.isArray(users) ? users.filter(
            (user) =>
                (selectedCarreras.length === 0 || selectedCarreras.includes(user.ou)) &&
                (selectedGroups.length === 0 || (user.groups && user.groups.some(group => selectedGroups.includes(group)))) &&
                Object.values(user).some((value) =>
                    value && value.toString().toLowerCase().includes(filter.toLowerCase())
                )
        ) : [];
    }, [filter, selectedCarreras, selectedGroups, users]);

    // Compute available Carreras based on current group filters
    const availableCarreras = useMemo(() => {
        const carreras = Array.isArray(users)
            ? users
                .filter((user) =>
                    selectedGroups.length === 0 || user.groups.some(group => selectedGroups.includes(group))
                )
                .map((user) => user.ou)
                .filter((ou) => ou)
            : [];
        return [...new Set(carreras)];
    }, [users, selectedGroups]);

    // Compute available Groups based on current carrera filters
    const availableGroups = useMemo(() => {
        const groups = Array.isArray(users)
            ? users
                .filter((user) =>
                    selectedCarreras.length === 0 || selectedCarreras.includes(user.ou)
                )
                .flatMap((user) => user.groups)
            : [];
        return [...new Set(groups)];
    }, [users, selectedCarreras]);

    const sortedUsers = useMemo(() => {
        if (!sortColumn) return filteredUsers;
        return [...filteredUsers].sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [filteredUsers, sortColumn, sortDirection]);

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return sortedUsers.slice(start, start + rowsPerPage);
    }, [sortedUsers, page, rowsPerPage]);

    const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);

    const toggleCarrera = useCallback((carrera) => {
        setSelectedCarreras((prev) =>
            prev.includes(carrera) ? prev.filter((c) => c !== carrera) : [...prev, carrera]
        );
    }, []);

    const toggleGroup = useCallback((group) => {
        setSelectedGroups((prev) =>
            prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
        );
    }, []);

    const clearCarreraFilter = useCallback(() => {
        setSelectedCarreras([]);
    }, []);

    const clearGroupFilter = useCallback(() => {
        setSelectedGroups([]);
    }, []);

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

    const toggleColumn = useCallback((key) => {
        if (columns.find((col) => col.key === key)?.fixed) return;
        setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]));
    }, []);

    const handleSort = useCallback((column) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }, [sortColumn]);

    // Función para eliminar usuarios individualmente mediante confirmación
    const handleAction = useCallback((action, userId) => {
        switch (action) {
            case "edit":
                console.log(`Editar usuario ${userId}`);
                // Aquí se puede abrir un modal de edición si se requiere
                break;
            case "delete":
                if (window.confirm(`¿Está seguro de eliminar el usuario ${userId}?`)) {
                    console.log(`Eliminar usuario ${userId}`);
                    // Lógica para eliminar usuario y actualizar la tabla
                    refreshUsers();
                    toast({ title: "Usuario eliminado" });
                }
                break;
            default:
                break;
        }
    }, [refreshUsers, toast]);

    // Función para eliminar múltiples usuarios seleccionados
    const handleDeleteSelected = useCallback(() => {
        if (selectedRows.length === 0) return;
        if (window.confirm(`¿Está seguro de eliminar los ${selectedRows.length} usuarios seleccionados?`)) {
            console.log("Eliminar usuarios:", selectedRows);
            // Aquí se puede implementar la eliminación masiva mediante una API
            setSelectedRows([]);
            refreshUsers();
            toast({ title: "Usuarios eliminados" });
        }
    }, [selectedRows, refreshUsers, toast]);

    return (
        <div className="p-4 space-y-4 min-h-screen relative">
            <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                    <Input
                        placeholder="Filtrar usuarios..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-dashed">
                                <Filter className="mr-2 h-4 w-4" />
                                Carreras
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            {availableCarreras.map((carrera) => {
                                const count = users.filter(
                                    (user) =>
                                        user.ou === carrera &&
                                        (selectedGroups.length === 0 || user.groups.some(group => selectedGroups.includes(group))) &&
                                        Object.values(user).some((value) =>
                                            value && value.toString().toLowerCase().includes(filter.toLowerCase())
                                        )
                                ).length;
                                return (
                                    <DropdownMenuItem key={carrera} onSelect={() => toggleCarrera(carrera)}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                {careerIcons[carrera]}
                                                <span className="ml-2">{carrera}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Badge variant="secondary" className="mr-2">
                                                    {count}
                                                </Badge>
                                                <Checkbox checked={selectedCarreras.includes(carrera)} />
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={clearCarreraFilter}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar filtros
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {selectedCarreras.map((carrera) => (
                        <Badge key={carrera} variant="secondary" className="px-2 py-1">
                            {carrera}
                            <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => toggleCarrera(carrera)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-dashed">
                                <Filter className="mr-2 h-4 w-4" />
                                Grupos
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            {availableGroups.map((group) => {
                                const count = Array.isArray(users) ? users.filter(
                                    (user) =>
                                        user.groups?.includes(group) &&
                                        (selectedCarreras.length === 0 || selectedCarreras.includes(user.ou)) &&
                                        Object.values(user).some((value) =>
                                            value && value.toString().toLowerCase().includes(filter.toLowerCase())
                                        )
                                ).length : 0;
                                return (
                                    <DropdownMenuItem key={group} onSelect={() => toggleGroup(group)}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <span className="ml-2">{group}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Badge variant="secondary" className="mr-2">
                                                    {count}
                                                </Badge>
                                                <Checkbox checked={selectedGroups.includes(group)} />
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={clearGroupFilter}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar filtros
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {selectedGroups.map((group) => (
                        <Badge key={group} variant="secondary" className="px-2 py-1">
                            {group}
                            <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => toggleGroup(group)}>
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-dashed">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {columns.filter((column) => !column.fixed).map((column) => (
                            <DropdownMenuItem key={column.key} onSelect={() => toggleColumn(column.key)}>
                                {visibleColumns.includes(column.key) ? <Check className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                                {column.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <ExportButton 
                    data={sortedUsers}
                    columns={columns.filter(col => col.key !== 'accion')}
                    filename="usuarios"
                />
                  <Button onClick={() => setOpen(true)}>Agregar Usuario</Button>
                  <AddUserForm open={open} onOpenChange={setOpen} refreshUsers={refreshUsers} />
            </div>
            <div className="rounded-lg shadow overflow-hidden">
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
                                                    <DropdownMenuItem onSelect={() => handleAction("edit", user.username)}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleAction("delete", user.username)}>
                                                        Eliminar
                                                    </DropdownMenuItem>
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
            </div>
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
            {/* Barra de acciones para múltiples usuarios seleccionados */}
            <div
                className={classNames(
                    'absolute inset-x-0 -bottom-14 mx-auto flex w-fit items-center space-x-3 rounded-full border bg-gray-800 px-4 py-2 text-white font-medium shadow',
                    selectedRows.length > 0 ? '' : 'hidden'
                )}
            ></div>
                <p className="select-none tabular-nums">
                    {selectedRows.length} usuario(s) seleccionados
                </p>
                <span className="h-4 w-px bg-gray-500" aria-hidden="true" />
                <button
                    type="button"
                    className="inline-flex items-center gap-2 hover:text-gray-300"
                    onClick={() => console.log("Editar selección:", selectedRows)}
                >
                    Editar
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500"></span>
                        E
                    </span>
                </button>
                <span className="h-4 w-px bg-gray-500" aria-hidden="true" />
                <button
                    type="button"
                    className="inline-flex items-center gap-2 hover:text-gray-300"
                    onClick={handleDeleteSelected}
                >
                    Eliminar
                    <span className="flex items-center space-x-1"></span>
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                            ⌘
                        </span>
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                            D
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
}


