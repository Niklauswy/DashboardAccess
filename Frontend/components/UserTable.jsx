'use client'
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import { useUserTableFilters } from "@/app/(routes)/(dashboard)/users/hooks/useUserTableFilters";
import { useUserTableState } from "@/app/(routes)/(dashboard)/users/hooks/useUserTableState";
import { useUsers } from "@/hooks/useUsers"; // Cambiado a useUsers
import UserTableFilters from "@/app/(routes)/(dashboard)/users/components/UserTableFilters";
import UserTableActions from "@/app/(routes)/(dashboard)/users/components/UserTableActions";
import UserTableContent from "@/app/(routes)/(dashboard)/users/components/UserTableContent";
import UserTablePagination from "@/app/(routes)/(dashboard)/users/components/UserTablePagination";
import BatchActionsBar from "@/app/(routes)/(dashboard)/users/components/BatchActionsBar";
import EditUserDialog from "@/app/(routes)/(dashboard)/users/components/EditUserDialog";
import DeleteUserDialog from "@/app/(routes)/(dashboard)/users/components/DeleteUserDialog";
import BatchActionDialog from "@/app/(routes)/(dashboard)/users/components/BatchActionDialog";
import AddUserForm from "@/app/(routes)/(dashboard)/users/components/AddUserForm";
import EditUserForm from '@/app/(routes)/(dashboard)/users/components/EditUserForm';

// Constants moved to a separate file and imported here
import { columns, careerIcons } from "@/app/(routes)/(dashboard)/users/components/userTableConstants";

export default function UserTable({ users, refreshUsers, isRefreshing }) {
    const { toast } = useToast();
    const { batchActions } = useUsers(); // Ahora usando el hook simplificado
    const [open, setOpen] = useState(false); // Add user dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [batchActionType, setBatchActionType] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    
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
                setUserToEdit(user);
                setEditUserOpen(true);
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

    const handleEditUser = (user) => {
        setUserToEdit(user);
        setEditUserOpen(true);
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

            {userToEdit && (
                <EditUserForm
                    open={editUserOpen}
                    onOpenChange={setEditUserOpen}
                    user={userToEdit}
                    refreshUsers={refreshUsers}
                />
            )}
        </div>
    );
}


