import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useUsers } from "@/hooks/useUsers"; // Añadir si es necesario

export default function BatchActionDialog({ open, onClose, actionType, selectedUsers, onConfirm }) {
  const [newPassword, setNewPassword] = useState("");
  //  display to max 10 items
  const displayedUsers = selectedUsers.length > 10 ? selectedUsers.slice(0, 10) : selectedUsers;

  const handleConfirm = () => {
    onConfirm(actionType === "changePassword" ? newPassword : null);
    setNewPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px]"
        aria-describedby="batch-action-description"
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
            />
          )}
        </div>
        <DialogFooter className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} variant={actionType==="delete" ? "destructive" : "default"}>
            {actionType === "delete" ? "Eliminar" : "Cambiar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
