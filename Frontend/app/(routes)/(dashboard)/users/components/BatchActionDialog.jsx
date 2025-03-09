import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useUsers } from "@/hooks/useUsers"; // Añadir si es necesario

export default function BatchActionDialog({ open, onClose, actionType, selectedUsers, onConfirm }) {
  const [newPassword, setNewPassword] = useState("");
  const previousFocusRef = useRef(null);
  const dialogContentRef = useRef(null);
  const displayedUsers = selectedUsers.length > 10 ? selectedUsers.slice(0, 10) : selectedUsers;

  // Store the active element when dialog opens
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
    } else {
      // Reset password state when dialog closes
      setNewPassword("");
    }
  }, [open]);
  
  // Handle return focus on close
  useEffect(() => {
    return () => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        // Return focus after a slight delay to ensure DOM is updated
        setTimeout(() => {
          previousFocusRef.current.focus();
        }, 0);
      }
    };
  }, []);

  const handleConfirm = () => {
    onConfirm(actionType === "changePassword" ? newPassword : null);
    // Clear state immediately
    setNewPassword("");
    // Explicitly call onClose to ensure proper state cleanup
    onClose(false);
  };

  // Explicitly handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Force cleanup when closing
          setNewPassword("");
        }
        onClose(isOpen);
      }}
    >
      <DialogContent 
        ref={dialogContentRef}
        className="sm:max-w-[600px]"
        aria-describedby="batch-action-description"
        onKeyDown={handleKeyDown}
        // Prevent events from bubbling beyond dialog
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {actionType === "delete" ? "Eliminar Usuarios" : "Cambiar Contraseñas"}
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
              autoFocus
            />
          )}
        </div>
        
        <DialogFooter className="flex justify-end gap-4 mt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onClose(false)}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={handleConfirm} 
            variant={actionType === "delete" ? "destructive" : "default"}
          >
            {actionType === "delete" ? "Eliminar" : "Cambiar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
