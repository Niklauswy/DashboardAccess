'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/components/lib/utils"
import { useValidation } from "@/hooks/useValidation"

export default function SerialUserCreator({
  onCreateUsers,
  isCreating,
  groups = [],
  ous = []
}) {
  const { validatePassword, validateField, validateArray } = useValidation();
  const [newUserPrefix, setNewUserPrefix] = useState("")
  const [newUserQuantity, setNewUserQuantity] = useState(1)
  const [newUserDefaultPassword, setNewUserDefaultPassword] = useState("")
  const [serieOU, setSerieOU] = useState("")
  const [serieGroups, setSerieGroups] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [openSeriesGroups, setOpenSeriesGroups] = useState(false)

  // Función para validar el formulario using the validation hook
  const validateSerialForm = () => {
    const errors = {};
    
    const prefixError = validateField(newUserPrefix, "prefijo");
    if (prefixError) errors.prefix = prefixError;
    
    const passwordError = validatePassword(newUserDefaultPassword);
    if (passwordError) errors.password = passwordError;
    
    const ouError = validateField(serieOU, "carrera");
    if (ouError) errors.ou = ouError;
    
    const groupsError = validateArray(serieGroups, "grupo");
    if (groupsError) errors.groups = groupsError;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Añadir una función centralizada para gestionar cambios de grupos
  const handleGroupsChange = (group) => {
    console.log("Grupo seleccionado (serie):", group);
    
    const updatedGroups = serieGroups.includes(group)
      ? serieGroups.filter((g) => g !== group)
      : [...serieGroups, group];
      
    setSerieGroups(updatedGroups);
  };

  const handleCreateUsers = () => {
    // Validar el formulario antes de enviarlo
    if (!validateSerialForm()) {
      return;
    }
    
    onCreateUsers({
      prefix: newUserPrefix,
      quantity: newUserQuantity,
      password: newUserDefaultPassword,
      ou: serieOU,
      groups: serieGroups
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Crear Usuarios en Serie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="user-prefix">Prefijo <span className="text-destructive">*</span></Label>
            <Input
              id="user-prefix"
              value={newUserPrefix}
              onChange={(e) => setNewUserPrefix(e.target.value)}
              placeholder="Ej: Invitado"
              className={formErrors.prefix ? "border-destructive" : ""}
            />
            {formErrors.prefix && (
              <p className="text-sm text-destructive">{formErrors.prefix}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="user-quantity">Cantidad de Usuarios: {newUserQuantity}</Label>
            <Slider
              id="user-quantity"
              min={1}
              max={50}
              step={1}
              value={[newUserQuantity]}
              onValueChange={(value) => setNewUserQuantity(value[0])}
            />
            <span className="w-12 text-right">{newUserQuantity}</span>
          </div>
          
          <div>
            <Label htmlFor="user-default-password">Contraseña por defecto <span className="text-destructive">*</span></Label>
            {/* Replace PasswordInput with regular Input */}
            <Input
              id="user-default-password"
              type="password"
              value={newUserDefaultPassword}
              onChange={(e) => setNewUserDefaultPassword(e.target.value)}
              placeholder="Ingrese la contraseña"
              className={formErrors.password ? "border-destructive" : ""}
            />
            {formErrors.password && (
              <p className="text-sm text-destructive">{formErrors.password}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="serie-ou">Carrera <span className="text-destructive">*</span></Label>
            <Select 
              value={serieOU} 
              onValueChange={setSerieOU} 
              id="serie-ou"
            >
              <SelectTrigger className={formErrors.ou ? "border-destructive" : ""}>
                <SelectValue placeholder="Seleccione una carrera" />
              </SelectTrigger>
              <SelectContent>
                {ous.map((ou) => (
                  <SelectItem key={ou} value={ou}>
                    {ou}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.ou && (
              <p className="text-sm text-destructive">{formErrors.ou}</p>
            )}
          </div>
          
          <div>
            <Label>Grupos <span className="text-destructive">*</span></Label>
            <Popover open={openSeriesGroups} onOpenChange={setOpenSeriesGroups}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  role="combobox" 
                  aria-expanded={openSeriesGroups} 
                  className={cn("w-full justify-between", formErrors.groups ? "border-destructive" : "")}
                  type="button"
                >
                  {serieGroups.length > 0 ? `${serieGroups.length} grupos seleccionados` : "Seleccione grupos"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar grupos..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {groups.map((group) => (
                        <CommandItem
                          key={group}
                          value={group}
                          onSelect={() => handleGroupsChange(group)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", serieGroups.includes(group) ? "opacity-100" : "opacity-0")} />
                          {group}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {formErrors.groups && (
              <p className="text-sm text-destructive">{formErrors.groups}</p>
            )}
            {serieGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {serieGroups.map((group) => (
                  <Badge key={group} variant="secondary" className="flex items-center gap-1">
                    {group}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleGroupsChange(group);
                      }} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={handleCreateUsers}
            disabled={isCreating}
          >
            {isCreating ? 'Procesando...' : 'Crear Usuarios'}
          </Button>
          
          {/* Información sobre requisitos */}
          <div className="text-xs text-gray-500 mt-2">
            <p>Todos los campos marcados con <span className="text-destructive">*</span> son obligatorios.</p>
            <p>La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
