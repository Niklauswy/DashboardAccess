import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";

export default function DeleteUserDialog({ open, onOpenChange, currentUser, onDelete }) {
    const { deleteUser } = useUsers();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    
    const handleDelete = async () => {
        if (!currentUser?.username) {
            return;
        }
        
        setIsDeleting(true);
        setError(null);
        
        try {
            await deleteUser(currentUser.username);
            onDelete();
            onOpenChange(false);
        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error.message || 'Error al eliminar el usuario');
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
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                            {error}
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
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
