'use client'
import React, {useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {RefreshCw} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useUserTableFilters} from "@/app/(routes)/users/hooks/useUserTableFilters";
import {useUserTableState} from "@/app/(routes)/users/hooks/useUserTableState";
import {useUsers} from "@/hooks/useUsers";
import {usePagination} from "@/hooks/usePagination";
import UserTableFilters from "@/app/(routes)/users/components/UserTableFilters";
import UserTableActions from "@/app/(routes)/users/components/UserTableActions";
import UserTableContent from "@/app/(routes)/users/components/UserTableContent";
import BatchActionsBar from "@/app/(routes)/users/components/BatchActionsBar";
import DeleteUserDialog from "@/app/(routes)/users/components/DeleteUserDialog";
import BatchActionDialog from "@/app/(routes)/users/components/BatchActionDialog";
import AddUserForm from "@/app/(routes)/users/components/AddUserForm";
import EditUserForm from '@/app/(routes)/users/components/EditUserForm';
import ProcessingDialog from '@/components/ProcessingDialog';

// Constants moved to a separate file and imported here
import {careerIcons, columns} from "@/app/(routes)/users/components/userTableConstants";
import {TablePagination} from "@/components/data-table/TablePagination";

export default function UserTable({users, refreshUsers, isRefreshing}) {
    const {toast} = useToast();
    const {batchActions} = useUsers();
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [batchActionType, setBatchActionType] = useState("");
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [batchProgress, setBatchProgress] = useState(0);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);

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
        visibleColumns, setVisibleColumns,
        selectedRows, setSelectedRows,
        toggleAllRows, toggleRow, toggleColumn,
    } = useUserTableState(columns);

    // Filtered users (keep this logic)
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

    const pagination = usePagination(filteredUsers, {
        initialPage: 1,
        initialPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        sortKey: 'username',
        sortDirection: 'asc'
    });

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

        if (batchActionType === "delete") {
            setIsProcessingBatch(true);
            setBatchProgress(0);

            // Set up beforeunload event handler
            window.addEventListener('beforeunload', handleBeforeUnload);

            try {
                // Pass the progress tracking callback directly
                const progressTracker = await batchActions.deleteUsers(selectedRows, (progress) => {
                    setBatchProgress(progress);
                });

                // After complete
                toast({
                    title: "Usuarios eliminados",
                    description: `Se han eliminado ${progressTracker.success.length} usuarios ${progressTracker.errors.length > 0 ? `(con ${progressTracker.errors.length} errores)` : ""}.`
                });

                // Clear selected rows
                setSelectedRows([]);
            } catch (error) {
                console.error('Batch operation error:', error);
                toast({
                    title: "Error",
                    description: error.message || "Hubo un problema al procesar la operación",
                    variant: "destructive"
                });
            } finally {
                setIsProcessingBatch(false);
                // Remove beforeunload event handler
                window.removeEventListener('beforeunload', handleBeforeUnload);
            }
        } else if (batchActionType === "changePassword") {
            // Handle password change with similar pattern
            setIsProcessingBatch(true);
            setBatchProgress(0);

            // Set up beforeunload event handler
            window.addEventListener('beforeunload', handleBeforeUnload);

            try {
                const progressTracker = await batchActions.updatePasswords(selectedRows, newPassword, (progress) => {
                    setBatchProgress(progress);
                });

                toast({
                    title: "Contraseñas actualizadas",
                    description: `Se ha actualizado la contraseña de ${progressTracker.success.length} usuarios ${progressTracker.errors.length > 0 ? `(con ${progressTracker.errors.length} errores)` : ""}.`
                });
                setSelectedRows([]);
            } catch (error) {
                console.error('Batch operation error:', error);
                toast({
                    title: "Error",
                    description: error.message || "Hubo un problema al procesar la operación",
                    variant: "destructive"
                });
            } finally {
                setIsProcessingBatch(false);
                // Remove beforeunload event handler
                window.removeEventListener('beforeunload', handleBeforeUnload);
            }
        }
    };

    // Add handler to prevent navigation during processing
    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '¿Está seguro de que desea salir? Hay un proceso en curso y se perderá el progreso.';
        return e.returnValue;
    };


    const selectedUsersList = users.filter(user => selectedRows.includes(user.username));

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
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}/>
                    {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {/* Segunda fila: Filtros y acciones */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 gap-4">
                {/* Filtros de carrera y grupo */}
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
                    sortedUsers={filteredUsers}
                    setOpen={setOpen}
                    // Asegurarse de que solo se muestre UN botón de columnas
                    showColumnToggle={true} // Solo este componente muestra el botón de columnas
                />
            </div>

            {/* Table content - Updated to use pagination.pageItems */}
            <UserTableContent
                columns={columns}
                visibleColumns={visibleColumns}
                paginatedUsers={pagination.pageItems}
                selectedRows={selectedRows}
                toggleAllRows={toggleAllRows}
                toggleRow={toggleRow}
                handleSort={pagination.requestSort}
                sortColumn={pagination.sort.key}
                sortDirection={pagination.sort.direction}
                handleAction={handleAction}
            />


            <TablePagination
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                setCurrentPage={pagination.setCurrentPage}
                setPageSize={pagination.setPageSize}
                totalItems={filteredUsers.length}
                totalPages={pagination.totalPages}
                pageSizeOptions={pagination.pageSizeOptions}
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
                    toast({title: "Usuario eliminado"});
                    refreshUsers();
                }}
            />

            <BatchActionDialog
                open={batchDialogOpen}
                onClose={() => setBatchDialogOpen(false)}
                actionType={batchActionType}
                selectedUsers={selectedUsersList}
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

            {/* Add ProcessingDialog for batch operations */}
            <ProcessingDialog
                open={isProcessingBatch}
                progress={batchProgress}
                actionText={batchActionType === "delete" ? "Eliminando usuarios" : "Actualizando contraseñas"}
            />
        </div>
    );
}


