import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

export default function BatchActionDialog({ open, onClose, actionType, selectedUsers, onConfirm }) {
  const [newPassword, setNewPassword] = useState("");
  const previousFocusRef = useRef(null);
  const displayedUsers = selectedUsers.length > 10 ? selectedUsers.slice(0, 10) : selectedUsers;

  // Store element with focus when dialog opens and handle cleanup
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
    } else {
      // Reset state when dialog closes
      setNewPassword("");
      
      // Force focus back to previous element after dialog closes
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        setTimeout(() => {
          previousFocusRef.current.focus();
        }, 0);
      }
    }
  }, [open]);

  const handleConfirm = () => {
    // Close dialog first, then perform action
    onClose();
    onConfirm(actionType === "changePassword" ? newPassword : null);
    setNewPassword("");
  };

  // Close handler with cleanup
  const handleClose = () => {
    setNewPassword("");
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setNewPassword("");
        }
        onClose(isOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        aria-describedby="batch-action-description"
      >
        <DialogHeader>
          <DialogTitle>
            {actionType === "delete" ? "Confirmar Eliminación" : "Cambiar Contraseña"}
          </DialogTitle>
          <DialogDescription id="batch-action-description">
            {actionType === "delete" 
              ? "Esta acción eliminará permanentemente los usuarios seleccionados." 
              : "Esta acción cambiará la contraseña de todos los usuarios seleccionados."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p>
            {actionType === "delete"
              ? "¿Está seguro de eliminar los siguientes usuarios?"
              : "Ingrese la nueva contraseña para los siguientes usuarios:"}
          </p>
          <ul className="list-disc pl-5">
            {displayedUsers.map((user) => (
              <li key={user.username}>{user.username}</li>
            ))}
            {selectedUsers.length > 10 && (
              <li>y {selectedUsers.length - 10} más...</li>
            )}
          </ul>
          {actionType === "changePassword" && (
            <PasswordInput
              id="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingrese la nueva contraseña para todos los usuarios"
              required
              className="mt-2"
            />
          )}
        </div>
        <DialogFooter className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm} variant={actionType==="delete" ? "destructive" : "default"}>
            {actionType === "delete" ? "Eliminar" : "Cambiar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
