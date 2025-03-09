import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/hooks/use-toast";

export default function DeleteUserDialog({ open, onOpenChange, currentUser, onDelete }) {
    const { deleteUser } = useUsers();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const previousFocusRef = useRef(null);
    
    // Store element with focus when dialog opens
    useEffect(() => {
        if (open) {
            previousFocusRef.current = document.activeElement;
        } else {
            // Reset state when dialog closes
            setError(null);
            setIsDeleting(false);
            
            // Force focus back to previous element after dialog closes
            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                setTimeout(() => {
                    previousFocusRef.current.focus();
                }, 0);
            }
        }
    }, [open]);
    
    const handleDelete = async () => {
        if (!currentUser?.username) return;
        
        setIsDeleting(true);
        setError(null);
        
        try {
            await deleteUser(currentUser.username);
            
            // Close dialog first, then notify
            onOpenChange(false);
            onDelete();
            
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

    // Close handler with cleanup
    const handleClose = () => {
        setError(null);
        onOpenChange(false);
    };

    return (
        <Dialog 
            open={open} 
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setError(null);
                }
                onOpenChange(isOpen);
            }}
        >
            <DialogContent 
                className="sm:max-w-[600px]"
                aria-describedby="delete-user-description"
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl">Eliminar Usuario</DialogTitle>
                    <DialogDescription id="delete-user-description">
                        Esta acción eliminará permanentemente el usuario del sistema.
                    </DialogDescription>
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
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
