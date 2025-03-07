'use client'
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import { useUserTableFilters } from "@/components/users/hooks/useUserTableFilters";
import { useUserTableState } from "@/components/users/hooks/useUserTableState";
import { useUsers } from "@/hooks/useUsers"; // Cambiado a useUsers
import TableHeader from "@/components/users/TableHeader";
import UserTableFilters from "@/components/users/UserTableFilters";
import UserTableActions from "@/components/users/UserTableActions";
import UserTableContent from "@/components/users/UserTableContent";
import UserTablePagination from "@/components/users/UserTablePagination";
import BatchActionsBar from "@/components/users/BatchActionsBar";
import EditUserDialog from "@/components/EditUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import BatchActionDialog from "@/components/BatchActionDialog";
import AddUserForm from "@/components/AddUserForm";

// Constants moved to a separate file and imported here
import { columns, careerIcons } from "@/components/users/userTableConstants";

export default function UserTable({ users, refreshUsers, isRefreshing }) {
    const { toast } = useToast();
    const { batchActions } = useUsers(); // Ahora usando el hook simplificado
    const [open, setOpen] = useState(false); // Add user dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [batchActionType, setBatchActionType] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    
    // Custom hooks to manage state and filters
    const {
        filter, setFilter,
        selectedCarreras, setSelectedCarreras,
        selectedGroups, setSelectedGroups,
        toggleCarrera, toggleGroup,
        clearCarreraFilter, clearGroupFilter,
        availableCarreras, availableGroups
    } = useUserTableFilters(users);
    
    const {
        page, setPage,
        rowsPerPage, setRowsPerPage,
        sortColumn, setSortColumn,
        sortDirection, setSortDirection,
        visibleColumns, setVisibleColumns,
        selectedRows, setSelectedRows,
        toggleAllRows, toggleRow, toggleColumn,
        handleSort
    } = useUserTableState(columns);

    // Filtered and sorted data
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
    
    const handleAction = (action, userId) => {
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
    };

    const handleBatchAction = (action) => {
        setBatchActionType(action);
        setBatchDialogOpen(true);
    };

    const handleBatchConfirm = async (newPassword) => {
        setBatchDialogOpen(false);
        
        try {
            if (batchActionType === "delete") {
                await batchActions.deleteUsers(selectedRows);
                toast({ 
                    title: "Usuarios eliminados", 
                    description: `Se han eliminado ${selectedRows.length} usuarios.` 
                });
            } else {
                await batchActions.updatePasswords(selectedRows, newPassword);
                toast({ 
                    title: "Contraseñas actualizadas", 
                    description: `Se ha actualizado la contraseña de ${selectedRows.length} usuarios.` 
                });
            }
            refreshUsers();
            setSelectedRows([]);
        } catch (error) {
            console.error('Batch operation error:', error);
            toast({ 
                title: "Error", 
                description: error.message || "Hubo un problema al procesar la operación",
                variant: "destructive"
            });
        }
    };

    const selectedUsers = users.filter(user => selectedRows.includes(user.username));

    return (
        <div className="flex flex-col space-y-4">
            {/* Primera fila: Input de búsqueda y botón de actualizar */}
            <div className="flex justify-between items-center gap-4">
                <Input
                    placeholder="Filtrar usuarios..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-md flex-1"
                />
                
                <Button 
                    variant="outline" 
                    onClick={refreshUsers} 
                    disabled={isRefreshing}
                    className="gap-2 ml-auto whitespace-nowrap"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {/* Segunda fila: Filtros y acciones */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 gap-4">
                {/* Filtros de carrera y grupo - Añadimos filter como prop */}
                <UserTableFilters
                    filter={filter}
                    selectedCarreras={selectedCarreras}
                    selectedGroups={selectedGroups}
                    toggleCarrera={toggleCarrera}
                    toggleGroup={toggleGroup}
                    clearCarreraFilter={clearCarreraFilter}
                    clearGroupFilter={clearGroupFilter}
                    availableCarreras={availableCarreras}
                    availableGroups={availableGroups}
                    users={users}
                    careerIcons={careerIcons}
                />
                
                {/* Acciones de tabla */}
                <UserTableActions 
                    columns={columns}
                    visibleColumns={visibleColumns}
                    toggleColumn={toggleColumn}
                    sortedUsers={sortedUsers}
                    setOpen={setOpen}
                />
            </div>

            {/* Table content */}
            <UserTableContent
                columns={columns}
                visibleColumns={visibleColumns}
                paginatedUsers={paginatedUsers}
                selectedRows={selectedRows}
                toggleAllRows={toggleAllRows}
                toggleRow={toggleRow}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                handleAction={handleAction}
            />
            
            {/* Pagination */}
            <UserTablePagination
                selectedRows={selectedRows}
                sortedUsers={sortedUsers}
                page={page}
                setPage={setPage}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                totalPages={totalPages}
            />

            {/* Batch action bar */}
            {selectedRows.length > 1 && (
                <BatchActionsBar
                    selectedCount={selectedRows.length}
                    onChangePassword={() => handleBatchAction("changePassword")}
                    onDelete={() => handleBatchAction("delete")}
                />
            )}

            {/* Dialogs */}
            <AddUserForm 
                open={open} 
                onOpenChange={setOpen} 
                refreshUsers={refreshUsers} 
            />
            
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
            
            <DeleteUserDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                currentUser={currentUser}
                onDelete={() => {
                    setDeleteDialogOpen(false);
                    toast({ title: "Usuario eliminado" });
                    refreshUsers();
                }}
            />
            
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


