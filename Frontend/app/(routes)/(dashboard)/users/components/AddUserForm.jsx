"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/components/lib/utils"
import { useOusAndGroups } from "@/hooks/useOusAndGroups";
import { useUsers } from "@/hooks/useUsers";
import { useValidation } from "@/hooks/useValidation"; // Using the validation hook

export default function AddUserForm({ refreshUsers, open, onOpenChange }) {
  const { toast } = useToast();
  const { ous, groups, isLoading } = useOusAndGroups();
  const { createUser } = useUsers();
  const { validatePassword, validateField, validateArray } = useValidation();
  
  const [newUser, setNewUser] = useState({
    samAccountName: "",
    givenName: "",
    sn: "",
    password: "",
    ou: "",
    groups: [],
  });
  const [errors, setErrors] = useState({});
  const [openGroups, setOpenGroups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle group selection without closing popover
  const handleGroupsChange = (group) => {
    console.log("Group selection:", group);
    
    setNewUser(prev => {
      const updatedGroups = prev.groups.includes(group)
        ? prev.groups.filter(g => g !== group)
        : [...prev.groups, group];
        
      return { ...prev, groups: updatedGroups };
    });
  };

  // Función para validar el formulario using the validation hook
  const validateForm = () => {
    const newErrors = {};

    // User field validation
    const samAccountNameError = validateField(newUser.samAccountName, "nombre de usuario");
    if (samAccountNameError) newErrors.samAccountName = samAccountNameError;

    // Name validation
    const givenNameError = validateField(newUser.givenName, "nombre");
    if (givenNameError) newErrors.givenName = givenNameError;

    // Last name validation
    const snError = validateField(newUser.sn, "apellido");
    if (snError) newErrors.sn = snError;

    // Password validation
    const passwordError = validatePassword(newUser.password);
    if (passwordError) newErrors.password = passwordError;

    // OU validation
    const ouError = validateField(newUser.ou, "carrera");
    if (ouError) newErrors.ou = ouError;

    // Groups validation
    const groupsError = validateArray(newUser.groups, "grupo");
    if (groupsError) newErrors.groups = groupsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleAddUser(e) {
    e.preventDefault();
    console.log("Submitting form with groups:", newUser.groups);
    
    // Validar el formulario antes de enviarlo
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true); // Activar estado de envío
    
    try {
      await createUser(newUser);
      onOpenChange(false);
      setNewUser({
        samAccountName: "",
        givenName: "",
        sn: "",
        password: "",
        ou: "",
        groups: [],
      });
      setErrors({});
      await refreshUsers();
      toast({
        title: "Usuario creado",
        description: `El usuario ${newUser.samAccountName} ha sido creado exitosamente.`,
        variant: "success",
      });
    } catch (error) {
      if (error.details) {
        console.error("Detalles:", error.details);
      }
      
      toast({
        title: "Error al crear usuario",
        description: error.message || "Error desconocido al agregar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Desactivar estado de envío
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Ensure we clean up when dialog closes
        if (!isOpen) {
          // Clean up state when closing
          setErrors({});
          setOpenGroups(false);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Agregar Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usuario */}
            <div className="space-y-2">
              <Label htmlFor="samAccountName">
                Usuario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="samAccountName"
                placeholder="Ingrese el usuario"
                value={newUser.samAccountName}
                onChange={(e) => setNewUser({ ...newUser, samAccountName: e.target.value })}
                className={errors.samAccountName ? "border-destructive" : ""}
              />
              {errors.samAccountName && (
                <p className="text-sm text-destructive">{errors.samAccountName}</p>
              )}
            </div>
            
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="givenName">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="givenName"
                placeholder="Ingrese el nombre"
                value={newUser.givenName}
                onChange={(e) => setNewUser({ ...newUser, givenName: e.target.value })}
                className={errors.givenName ? "border-destructive" : ""}
              />
              {errors.givenName && (
                <p className="text-sm text-destructive">{errors.givenName}</p>
              )}
            </div>
            
            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="sn">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sn"
                placeholder="Ingrese el apellido"
                value={newUser.sn}
                onChange={(e) => setNewUser({ ...newUser, sn: e.target.value })}
                className={errors.sn ? "border-destructive" : ""}
              />
              {errors.sn && (
                <p className="text-sm text-destructive">{errors.sn}</p>
              )}
            </div>
            
            {/* Contraseña - Changed to regular Input */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Ingrese la contraseña"
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            {/* Unidad Organizativa (Carrera) */}
            <div className="space-y-2">
              <Label htmlFor="ou">
                Carrera <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={newUser.ou} 
                onValueChange={(value) => setNewUser({ ...newUser, ou: value })}
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

            {/* Grupos - Completely redesigned with a simpler approach */}
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
                  {newUser.groups.length > 0 
                    ? `${newUser.groups.length} grupos seleccionados` 
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
                        onChange={(e) => {
                          // Implementar búsqueda en tiempo real si es necesario
                        }}
                      />
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto">
                      {groups?.map((group) => (
                        <div 
                          key={group} 
                          className={cn(
                            "flex items-center p-2 cursor-pointer hover:bg-gray-100",
                            newUser.groups.includes(group) && "bg-gray-100"
                          )}
                          onClick={() => handleGroupsChange(group)}
                        >
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={newUser.groups.includes(group)}
                            onChange={() => {}}
                            onClick={(e) => e.stopPropagation()}
                            id={`group-${group}`}
                          />
                          <label 
                            htmlFor={`group-${group}`}
                            className="grow cursor-pointer"
                          >
                            {group}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-2 border-t flex justify-between">
                      <span className="text-sm text-gray-500">
                        {newUser.groups.length} seleccionados
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
              
              {newUser.groups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newUser.groups.map((group) => (
                    <Badge key={group} variant="secondary" className="flex items-center gap-1">
                      {group}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewUser(prev => ({
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
              {isSubmitting ? 'Agregando...' : 'Agregar Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

