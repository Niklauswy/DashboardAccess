"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/components/lib/utils"
import { useOusAndGroups } from "@/hooks/useOusAndGroups"
import { useUsers } from "@/hooks/useUsers"
import { useValidation } from "@/hooks/useValidation"

export default function EditUserDialog({ open, onOpenChange, currentUser, onUpdate }) {
  const { toast } = useToast();
  const { ous, groups, isLoading } = useOusAndGroups();
  const { updateUser } = useUsers();
  const { validatePassword, validateField, validateArray } = useValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editedUser, setEditedUser] = useState({
    samAccountName: "",
    givenName: "",
    sn: "",
    password: "", // opcional para edición
    ou: "",
    groups: [],
  });
  
  const [errors, setErrors] = useState({});
  const [openGroups, setOpenGroups] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Cargar datos de usuario al abrir
  useEffect(() => {
    if (currentUser && open) {
      setEditedUser({
        samAccountName: currentUser.samAccountName || currentUser.username || "",
        givenName: currentUser.givenName || currentUser.name || "",
        sn: currentUser.sn || "",
        password: "", // Siempre vacío al inicio
        ou: currentUser.ou || "",
        groups: currentUser.groups || [],
      });
      setChangePassword(false);
    }
  }, [currentUser, open]);

  // Función para validar el formulario
  const validateForm = () => {
    // ...existing code...
    // (El código de validación que ya tenías)
  };

  // Función para manejar grupos
  const handleGroupsChange = (group) => {
    // ...existing code...
    // (El código de manejo de grupos que ya tenías)
  };

  // Enviar el formulario
  async function handleUpdateUser(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const dataToUpdate = { ...editedUser };
      if (!changePassword) delete dataToUpdate.password;
      
      await updateUser(currentUser.username || currentUser.samAccountName, dataToUpdate);
      
      onUpdate(); // Llamar al callback de actualización exitosa
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${editedUser.samAccountName} ha sido actualizado exitosamente.`,
        variant: "success",
      });
    } catch (error) {
      if (error.details) console.error("Detalles:", error.details);
      
      toast({
        title: "Error al actualizar usuario",
        description: error.message || "Error desconocido al actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {/* ... Resto del UI que implementé en EditUserForm ... */}
      </DialogContent>
    </Dialog>
  );
}