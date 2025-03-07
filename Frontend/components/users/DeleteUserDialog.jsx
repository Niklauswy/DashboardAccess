import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/services/userService";

export default function DeleteUserDialog({ open, onOpenChange, currentUser, onDelete }) {
    const handleDelete = async () => {
        try {
            // Usar el servicio para eliminar el usuario
            if (currentUser?.username) {
                await deleteUser(currentUser.username);
                onDelete();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
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
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
