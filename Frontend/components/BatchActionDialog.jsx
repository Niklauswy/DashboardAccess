import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BatchActionDialog({ open, onClose, actionType, selectedUsers, onConfirm }) {
  const [newPassword, setNewPassword] = useState("");

  const handleConfirm = () => {
    // Pass the new password if actionType is changePassword; else just confirm deletion
    onConfirm(actionType === "changePassword" ? newPassword : null);
    setNewPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {actionType === "delete" ? "Confirmar Eliminación" : "Cambiar Contraseña"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <p>
            {actionType === "delete"
              ? "¿Está seguro de eliminar los siguientes usuarios?"
              : "Ingrese la nueva contraseña para los siguientes usuarios:"}
          </p>
          <ul className="list-disc pl-5">
            {selectedUsers.map((user) => (
              <li key={user.username}>{user.username}</li>
            ))}
          </ul>
          {actionType === "changePassword" && (
            <Input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          )}
        </div>
        <DialogFooter className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>
            {actionType === "delete" ? "Eliminar" : "Cambiar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
