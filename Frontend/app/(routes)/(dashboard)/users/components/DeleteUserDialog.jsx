import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";
import { toast } from "@/components/hooks/use-toast"; // Add toast if available, or use an alternative notification system

export default function DeleteUserDialog({ open, onOpenChange, currentUser, onDelete }) {
    const { deleteUser } = useUsers();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    
    const handleDelete = async () => {
        if (!currentUser?.username) return;
        
        setIsDeleting(true);
        setError(null);
        
        try {
            console.log(`Deleting user: ${currentUser.username}`);
            await deleteUser(currentUser.username);
            console.log(`User deleted successfully`);
            
            // Close dialog and notify parent
            onOpenChange(false);
            onDelete();
            
            // Show success notification if toast is available
            if (typeof toast === 'function') {
                toast({
                    title: "Usuario eliminado",
                    description: `El usuario ${currentUser.username} ha sido eliminado exitosamente.`,
                    variant: "success",
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error.message || 'Error al eliminar usuario');
            
            // Show error notification if toast is available
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
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
                            onClick={() => onOpenChange(false)}
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
