"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {useToast} from "@/hooks/use-toast"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useValidation} from "@/hooks/useValidation"

export default function BatchActionDialog({ 
  open, 
  onClose, 
  actionType = "", 
  selectedUsers = [],
  onConfirm 
}) {
  const { validatePassword } = useValidation();
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setNewPassword("");
    setPasswordError("");
    onClose();
  };

  const handleConfirm = async () => {
    // For delete action, just confirm
    if (actionType === "delete") {
      setIsProcessing(true);
      try {
        await onConfirm();
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    
    if (actionType === "changePassword") {

      const error = validatePassword(newPassword);
      if (error) {
        setPasswordError(error);
        return;
      }
      
      setIsProcessing(true);
      try {
        await onConfirm(newPassword);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Hubo un problema al cambiar las contraseñas",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      }
    }}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onEscapeKeyDown={handleClose}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {actionType === "delete" 
              ? "Eliminar usuarios" 
              : "Cambiar contraseñas"
            }
          </DialogTitle>
          <DialogDescription>
            {actionType === "delete" 
              ? `¿Está seguro de eliminar ${selectedUsers.length} usuarios? Esta acción no se puede deshacer.` 
              : `Establecer nueva contraseña para ${selectedUsers.length} usuarios.`
            }
          </DialogDescription>
        </DialogHeader>

        {actionType === "changePassword" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-batch-password">
                Nueva contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-batch-password"
                type="password"
                placeholder="Ingrese la nueva contraseña"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                className={passwordError ? "border-destructive" : ""}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número.</p>
            </div>
          </div>
        )}

        {actionType === "delete" && (
          <div className="py-4">
            <div className="max-h-[200px] overflow-y-auto rounded border p-2">
              <p className="font-medium mb-2">
                Usuarios seleccionados: <span className="text-primary">{selectedUsers.length}</span>
              </p>
              <ul className="list-disc list-inside space-y-1">
                {selectedUsers.slice(0, 8).map(user => (
                  <li key={user.username} className="text-sm">
                    {user.givenName || ''} {user.sn || ''} <span className="text-gray-500">({user.username})</span>
                  </li>
                ))}
                {selectedUsers.length > 8 && (
                  <li className="text-sm font-medium text-gray-600 mt-1 pt-1 border-t">
                    ...y {selectedUsers.length - 8} usuarios más
                  </li>
                )}
              </ul>
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Esta acción eliminará a todos los usuarios seleccionados y no puede deshacerse.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant={actionType === "delete" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isProcessing || (actionType === "changePassword" && !newPassword)}
          >
            {isProcessing 
              ? (actionType === "delete" ? 'Eliminando...' : 'Actualizando...') 
              : (actionType === "delete" ? 'Eliminar' : 'Actualizar')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
