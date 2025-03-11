"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/components/lib/utils"
import { useOusAndGroups } from "@/hooks/useOusAndGroups";
import { useUsers } from "@/hooks/useUsers";
import { useValidation } from "@/hooks/useValidation";

export default function EditUserForm({ user, refreshUsers, open, onOpenChange }) {
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
    if (user && open) {
      setEditedUser({
        samAccountName: user.samAccountName || user.username || "",
        givenName: user.givenName || "", // Usar directamente givenName
        sn: user.sn || "", // Usar directamente sn
        password: "", // Siempre vacío al inicio
        ou: user.ou || "",
        groups: user.groups || [],
      });
      setChangePassword(false); // Reiniciar estado de cambio de contraseña
    }
  }, [user, open]);

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar campos obligatorios
    const samAccountNameError = validateField(editedUser.samAccountName, "nombre de usuario");
    if (samAccountNameError) newErrors.samAccountName = samAccountNameError;

    const givenNameError = validateField(editedUser.givenName, "nombre");
    if (givenNameError) newErrors.givenName = givenNameError;

    const snError = validateField(editedUser.sn, "apellido");
    if (snError) newErrors.sn = snError;

    // Validar contraseña solo si se va a cambiar
    if (changePassword) {
      const passwordError = validatePassword(editedUser.password);
      if (passwordError) newErrors.password = passwordError;
    }

    // Validar OU
    const ouError = validateField(editedUser.ou, "carrera");
    if (ouError) newErrors.ou = ouError;

    // Validar grupos
    const groupsError = validateArray(editedUser.groups, "grupo");
    if (groupsError) newErrors.groups = groupsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar selección de grupos
  const handleGroupsChange = (group) => {
    setEditedUser(prev => {
      const updatedGroups = prev.groups.includes(group)
        ? prev.groups.filter(g => g !== group)
        : [...prev.groups, group];
        
      return { ...prev, groups: updatedGroups };
    });
  };

  // Enviar el formulario de actualización
  async function handleUpdateUser(e) {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Solo incluir contraseña si se va a cambiar
      const dataToUpdate = {
        ...editedUser,
        // Asegurarse de que no se modifique el nombre de usuario original
        samAccountName: user.samAccountName || user.username
      };
      
      if (!changePassword) {
        delete dataToUpdate.password;
      }
      
      // Llamar a la API para actualizar
      await updateUser(user.samAccountName || user.username, dataToUpdate);
      
      // Cerrar y limpiar
      onOpenChange(false);
      await refreshUsers();
      
      toast({
        title: "Usuario actualizado",
        description: `El usuario ${editedUser.samAccountName} ha sido actualizado exitosamente.`,
        variant: "success",
      });
    } catch (error) {
      if (error.details) {
        console.error("Detalles:", error.details);
      }
      
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
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Clean up when dialog closes
        if (!isOpen) {
          setErrors({});
          setOpenGroups(false);
          // Force focus back to document body
          setTimeout(() => {
            document.body.focus();
          }, 10);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        // Important: Add these handlers to fix focus issues
        onEscapeKeyDown={() => onOpenChange(false)}
        onPointerDownOutside={(e) => {
          // Allow outside clicks but prevent focus trap issues
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Don't let interactions outside trigger focus change
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usuario  */}
            <div className="space-y-2">
              <Label htmlFor="edit-samAccountName">
                Usuario <span className="text-gray-500"></span>
              </Label>
              <Input
                id="edit-samAccountName"
                value={editedUser.samAccountName}
                className="bg-gray-50"
                disabled={true}
              />
              <p className="text-xs text-muted-foreground">El nombre de usuario no puede ser modificado para mantener la integridad de datos.</p>
            </div>
            
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="edit-givenName">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-givenName"
                placeholder="Ingrese el nombre"
                value={editedUser.givenName}
                onChange={(e) => setEditedUser({ ...editedUser, givenName: e.target.value })}
                className={errors.givenName ? "border-destructive" : ""}
              />
              {errors.givenName && (
                <p className="text-sm text-destructive">{errors.givenName}</p>
              )}
            </div>
            
            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="edit-sn">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-sn"
                placeholder="Ingrese el apellido"
                value={editedUser.sn}
                onChange={(e) => setEditedUser({ ...editedUser, sn: e.target.value })}
                className={errors.sn ? "border-destructive" : ""}
              />
              {errors.sn && (
                <p className="text-sm text-destructive">{errors.sn}</p>
              )}
            </div>
            
            {/* Contraseña (opcional para edición) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-password">Contraseña</Label>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="change-password" 
                    className="mr-2"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                  />
                  <Label htmlFor="change-password" className="text-xs cursor-pointer">Cambiar contraseña</Label>
                </div>
              </div>
              <Input
                id="edit-password"
                type="password"
                value={editedUser.password}
                onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })}
                placeholder={changePassword ? "Ingrese la nueva contraseña" : "No se cambiará la contraseña"}
                className={errors.password ? "border-destructive" : ""}
                disabled={!changePassword}
              />
              {errors.password && changePassword && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            {/* Unidad Organizativa */}
            <div className="space-y-2">
              <Label htmlFor="edit-ou">
                Carrera <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={editedUser.ou} 
                onValueChange={(value) => setEditedUser({ ...editedUser, ou: value })}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.ou ? "border-destructive" : ""}>
                  <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccione una carrera"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : ous && ous.length > 0 ? (
                    ous.map((ou) => (
                      <SelectItem key={ou} value={ou}>{ou}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No hay carreras disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.ou && (
                <p className="text-sm text-destructive">{errors.ou}</p>
              )}
            </div>
            
            {/* Grupos */}
            <div className="space-y-2">
              <Label>
                Grupos <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full justify-between", errors.groups ? "border-destructive" : "")}
                  onClick={() => setOpenGroups(!openGroups)}
                >
                  {editedUser.groups.length > 0 
                    ? `${editedUser.groups.length} grupos seleccionados` 
                    : "Seleccione grupos"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                
                {openGroups && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <div className="p-2">
                      <input 
                        type="text" 
                        placeholder="Buscar grupos..." 
                        className="w-full p-2 border rounded-md mb-2"
                      />
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto">
                      {groups?.map((group) => (
                        <div 
                          key={group} 
                          className={cn(
                            "flex items-center p-2 cursor-pointer hover:bg-gray-100",
                            editedUser.groups.includes(group) && "bg-gray-100"
                          )}
                          onClick={() => handleGroupsChange(group)}
                        >
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={editedUser.groups.includes(group)}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            id={`edit-group-${group}`}
                          />
                          <label 
                            htmlFor={`edit-group-${group}`}
                            className="grow cursor-pointer"
                          >
                            {group}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-2 border-t flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {editedUser.groups.length} seleccionados
                      </span>
                      <Button 
                        type="button"
                        size="sm" 
                        onClick={() => setOpenGroups(false)}
                      >
                        Aceptar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {errors.groups && (
                <p className="text-sm text-destructive">{errors.groups}</p>
              )}
              
              {editedUser.groups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editedUser.groups.map((group) => (
                    <Badge key={group} variant="secondary" className="flex items-center gap-1">
                      {group}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditedUser(prev => ({
                            ...prev,
                            groups: prev.groups.filter(g => g !== group)
                          }));
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
