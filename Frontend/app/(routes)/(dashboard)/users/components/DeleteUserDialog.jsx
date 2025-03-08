import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useState, useEffect } from "react";
import { toast } from "@/components/hooks/use-toast";

export default function DeleteUserDialog({ open, onOpenChange, currentUser, onDelete }) {
    const { deleteUser } = useUsers();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    
    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setIsDeleting(false);
            setError(null);
        }
    }, [open]);
    
    const handleDelete = async () => {
        if (!currentUser?.username) return;
        
        setIsDeleting(true);
        setError(null);
        
        try {
            await deleteUser(currentUser.username);
            
            // Important: First call the callback, then close the dialog
            if (typeof onDelete === 'function') {
                onDelete();
            }
            
            onOpenChange(false);
            
            if (typeof toast === 'function') {
                toast({
                    title: "Usuario eliminado",
                    description: `El usuario ${currentUser.username} ha sido eliminado exitosamente.`,
                    variant: "success",
                });
            }
        } catch (error) {
            setError(error.message || 'Error al eliminar usuario');
            
            if (typeof toast === 'function') {
                toast({
                    title: "Error",
                    description: error.message || 'Error al eliminar usuario',
                    variant: "destructive",
                });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle close with a dedicated function
    const handleClose = () => {
        if (isDeleting) return; // Prevent closing while operation is in progress
        onOpenChange(false);
    };

    return (
        <Dialog 
            open={open} 
            onOpenChange={handleClose}
            // Ensure proper focus management
            modal={true}
        >
            <DialogContent 
                className="sm:max-w-[600px]"
                // Prevent click events from propagating outside
                onClick={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl">Eliminar Usuario</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                    <p>
                        ¿Está seguro de eliminar el usuario <strong>{currentUser?.username}</strong>?
                    </p>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleClose}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                        ></Button>
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
