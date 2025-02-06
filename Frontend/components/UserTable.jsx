'use client'
import { useState, useMemo, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddUserForm from "@/components/AddUserForm";
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
import { useToast } from "@/hooks/use-toast"
import EditUserDialog from "@/components/EditUserDialog";
import BatchActionDialog from "@/components/BatchActionDialog";

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
    { key: "groups", label: "Grupos", sortable: false }, 
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
    const [newUser, setNewUser] = useState({
        samAccountName: '',
        givenName: '',
        sn: '',
        password: '',
  
    });
    const [ous, setOus] = useState([]);
    const [groups, setGroups] = useState([]);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [open, setOpen] = useState(false)
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [batchActionType, setBatchActionType] = useState(""); // "delete" or "changePassword"

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

    const handleDeleteSelected = useCallback(() => {
        if (selectedRows.length < 2) return;
        if (window.confirm(`¿Está seguro de eliminar los ${selectedRows.length} usuarios seleccionados?`)) {
            console.log("Eliminar usuarios en conjunto:", selectedRows);
            // Implementa la eliminación masiva vía API aquí
            setSelectedRows([]);
            refreshUsers();
            toast({ title: "Usuarios eliminados" });
        }
    }, [selectedRows, refreshUsers, toast]);

    const handleBatchAction = (action) => {
        setBatchActionType(action);
        setBatchDialogOpen(true);
    };

    const selectedUsers = users.filter(user => selectedRows.includes(user.username));

    const handleBatchConfirm = async (newPassword) => {
        setBatchDialogOpen(false);
        if (batchActionType === "delete") {
            // Perform deletion for selected users
            console.log("Eliminando usuarios:", selectedRows);
            // Implement API call for batch deletion here...
            toast({ title: "Usuarios eliminados" });
            refreshUsers();
        } else {
            // Perform password update for all selected users using newPassword
            console.log("Cambiando contraseña a:", newPassword, "para usuarios:", selectedRows);
            // Implement API call for batch password update here...
            toast({ title: "Contraseña actualizada" });
            refreshUsers();
        }
        // Reset selected rows if needed
        setSelectedRows([]);
    };

    // New keyboard shortcuts for batch actions
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = e.target.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
            if (selectedRows.length > 1) {
                if (e.key.toLowerCase() === "c") {
                    e.preventDefault();
                    handleBatchAction("changePassword");
                } else if (e.key.toLowerCase() === "d") {
                    e.preventDefault();
                    handleBatchAction("delete");
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedRows]);

    return (
        <div className="p-4 space-y-4 min-h-screen relative">
            {/* Fila de filtros */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                    <Input
                        placeholder="Filtrar usuarios..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="max-w-sm flex-shrink-0"
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
                {/* Fila de acciones */}
                <div className="flex items-center gap-4">
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
                                                    <DropdownMenuItem onSelect={() => handleAction("edit", user.username)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleAction("delete", user.username)}>Eliminar</DropdownMenuItem>
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
                            <option>10</option>
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
            {selectedRows.length > 1 && (
                <div
                    className={
                        'fixed bottom-0 left-0 right-0 mx-auto flex w-fit items-center space-x-3 rounded-full border bg-gray-800 px-4 py-2 text-white font-medium shadow z-50'
                    }
                >
                    <p className="select-none">
                        {selectedRows.length} usuarios seleccionados
                    </p>
                    <span className="h-4 w-px bg-gray-500" aria-hidden="true" />
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 hover:text-gray-300"
                        onClick={() => handleBatchAction("changePassword")}
                    >
                        Cambiar contraseña
                        <span className="flex items-center space-x-1">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                                ⌘
                            </span>
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                                C
                            </span>
                        </span>
                    </button>

                    <span className="h-4 w-px bg-gray-500" aria-hidden="true" />
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 hover:text-gray-300"
                        onClick={() => handleBatchAction("delete")}
                    >
                        Eliminar
                        <span className="flex items-center space-x-1">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                                ⌘
                            </span>
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-700 text-sm ring-1 ring-gray-500">
                                D
                            </span>
                        </span>
                    </button>
                </div>
            )}
            <EditUserDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                currentUser={currentUser}
                onUpdate={() => {
                    setEditDialogOpen(false);
                    toast({ title: "Usuario actualizado" });
                    refreshUsers();
                }}
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Eliminar Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <p>
                            ¿Está seguro de eliminar el usuario <strong>{currentUser?.username}</strong>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="button" variant="destructive" onClick={() => {
                                setDeleteDialogOpen(false);
                                toast({ title: "Usuario eliminado" });
                                refreshUsers();
                            }}>
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <BatchActionDialog
                open={batchDialogOpen}
                onClose={() => setBatchDialogOpen(false)}
                actionType={batchActionType}
                selectedUsers={selectedUsers}
                onConfirm={handleBatchConfirm}
            />
        </div>
    );
    
}


