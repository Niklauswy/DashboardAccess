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
import { PasswordInput } from "@/components/PasswordInput"

export default function SerialUserCreator({
  onCreateUsers,
  isCreating,
  groups = [],
  ous = []
}) {
  const [newUserPrefix, setNewUserPrefix] = useState("")
  const [newUserQuantity, setNewUserQuantity] = useState(1)
  const [newUserDefaultPassword, setNewUserDefaultPassword] = useState("")
  const [serieOU, setSerieOU] = useState("")
  const [serieGroups, setSerieGroups] = useState([])
  const [seriePasswordError, setSeriePasswordError] = useState("")
  const [openSeriesGroups, setOpenSeriesGroups] = useState(false)

  const handleCreateUsers = () => {
    if (!newUserPrefix) {
      return;
    }
    
    if (!newUserDefaultPassword) {
      setSeriePasswordError("Ingrese una contraseña válida.")
      return
    }
    
    if (newUserDefaultPassword.length < 8) {
      setSeriePasswordError("La contraseña debe tener al menos 8 caracteres.")
      return
    }
    
    setSeriePasswordError("")
    
    onCreateUsers({
      prefix: newUserPrefix,
      quantity: newUserQuantity,
      password: newUserDefaultPassword,
      ou: serieOU === "none" ? "" : serieOU,
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
            <Label htmlFor="user-prefix">Prefijo</Label>
            <Input
              id="user-prefix"
              value={newUserPrefix}
              onChange={(e) => setNewUserPrefix(e.target.value)}
              placeholder="Ej: Invitado"
            />
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
            <Label htmlFor="user-default-password">Contraseña por defecto</Label>
            <PasswordInput
              id="user-default-password"
              value={newUserDefaultPassword}
              onChange={(e) => setNewUserDefaultPassword(e.target.value)}
              placeholder="Ingrese la contraseña"
            />
            {seriePasswordError && <p className="text-sm text-destructive">{seriePasswordError}</p>}
          </div>
          <div>
            <Label htmlFor="serie-ou">Carrera</Label>
            <Select value={serieOU} onValueChange={setSerieOU} id="serie-ou">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="empty" value="none">
                  Ninguna
                </SelectItem>
                {ous.map((ou) => (
                  <SelectItem key={ou} value={ou}>
                    {ou}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Grupos</Label>
            <Popover open={openSeriesGroups} onOpenChange={setOpenSeriesGroups}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openSeriesGroups} className="w-full justify-between">
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
                      <CommandItem key="empty-groups" onSelect={() => setSerieGroups([])}>
                        Ninguno
                      </CommandItem>
                      {groups.map((group) => (
                        <CommandItem
                          key={group}
                          onSelect={() => {
                            setSerieGroups(serieGroups.includes(group)
                              ? serieGroups.filter((g) => g !== group)
                              : [...serieGroups, group])
                          }}
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
            {serieGroups.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {serieGroups.map((group) => (
                  <Badge key={group} variant="secondary" className="flex items-center gap-1">
                    {group}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSerieGroups(serieGroups.filter((g) => g !== group))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={handleCreateUsers}
            disabled={isCreating || !newUserPrefix || !newUserDefaultPassword}
          >
            {isCreating ? 'Procesando...' : 'Crear Usuarios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
