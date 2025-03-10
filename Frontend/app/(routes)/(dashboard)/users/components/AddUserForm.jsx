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
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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

            {/* Grupos - Complete refactor to solve selection issues */}
            <div className="space-y-2">
              <Label>
                Grupos <span className="text-destructive">*</span>
              </Label>
              <Popover 
                open={openGroups} 
                onOpenChange={setOpenGroups}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    className={cn("w-full justify-between", errors.groups ? "border-destructive" : "")}
                    disabled={isLoading}
                  >
                    {newUser.groups.length > 0 
                      ? `${newUser.groups.length} grupos seleccionados` 
                      : "Seleccione grupos"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-[300px] overflow-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-sm">Cargando grupos...</div>
                    ) : groups && groups.length > 0 ? (
                      <div>
                        {groups.map((group) => (
                          <div 
                            key={group}
                            className={cn(
                              "flex items-center px-4 py-2 cursor-pointer hover:bg-muted",
                              newUser.groups.includes(group) && "bg-muted"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Toggle group selection
                              setNewUser(prev => {
                                const newGroups = prev.groups.includes(group)
                                  ? prev.groups.filter(g => g !== group)
                                  : [...prev.groups, group];
                                
                                return { ...prev, groups: newGroups };
                              });
                            }}
                          >
                            <div className={cn(
                              "mr-2 h-4 w-4 border rounded-sm flex items-center justify-center",
                              newUser.groups.includes(group) ? "bg-primary border-primary" : "border-input"
                            )}>
                              {newUser.groups.includes(group) && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span>{group}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm">No hay grupos disponibles</div>
                    )}
                  </div>
                  <div className="p-2 border-t flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {newUser.groups.length} seleccionados
                    </span>
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => setOpenGroups(false)}
                    >
                      Aceptar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Usuario</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

