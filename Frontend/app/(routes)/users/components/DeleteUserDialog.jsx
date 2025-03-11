"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUsers } from '@/hooks/useUsers';

export default function DeleteUserDialog({ open, onOpenChange, currentUser, onDelete }) {
  const { toast } = useToast();
  const { deleteUser } = useUsers();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(currentUser.username || currentUser.samAccountName);
      onDelete();
    } catch (error) {
      toast({
        title: "Error al eliminar usuario",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Clean up when dialog closes
        if (!isOpen) {
          // Force focus back to document body
          setTimeout(() => {
            document.body.focus();
          }, 10);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onEscapeKeyDown={() => onOpenChange(false)}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Está seguro de que desea eliminar al usuario{" "}
            <span className="font-medium">
              {currentUser?.givenName 
                ? `${currentUser.givenName} ${currentUser.sn}`
                : currentUser?.username || ""}
            </span>?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
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
            disabled={isDeleting}
            onClick={handleDeleteConfirm}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
