"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddUserForm({ refreshUsers, open, onOpenChange }) {
  const { toast } = useToast()
  const [newUser, setNewUser] = useState({
    samAccountName: "",
    givenName: "",
    sn: "",
    password: "",
    ou: "",
    groups: [],
  })
  const [ous, setOus] = useState([])
  const [groups, setGroups] = useState([])
  const [openGroups, setOpenGroups] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const ouRes = await fetch("/api/ous")
      const ouData = await ouRes.json()
      setOus(ouData)
      const groupRes = await fetch("/api/groups")
      const groupData = await groupRes.json()
      setGroups(groupData)
    }
    fetchData()
  }, [])

  async function handleAddUser(e) {
    e.preventDefault()
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) {
        onOpenChange(false)
        setNewUser({
          samAccountName: "",
          givenName: "",
          sn: "",
          password: "",
          ou: "",
          groups: [],
        })
        await refreshUsers()
        toast({
          title: "Usuario creado",
          description: `El usuario ${newUser.samAccountName} ha sido creado exitosamente.`,
        })
      } else {
        let fullErrorMessage = data.details || "Error desconocido al agregar el usuario."

        const lines = fullErrorMessage.split("\n")
 
        console.error("Server error:", data)
        toast({
          title: "Error",
          description: fullErrorMessage,
          variant: "destructive",
        })

      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error inesperado",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
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
                required
              />
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
                required
              />
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
                required
              />
            </div>
            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese la contraseña"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>
            {/* Unidad Organizativa (Carrera) */}
            <div className="space-y-2">
              <Label htmlFor="ou">
                Carrera <span className="text-destructive">*</span>
              </Label>
              <Select value={newUser.ou} onValueChange={(value) => setNewUser({ ...newUser, ou: value })} required >
                <SelectTrigger>
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
            </div>
            {/* Grupos */}
            <div className="space-y-2">
              <Label>
                Grupos <span className="text-destructive">*</span>
              </Label>
              <Popover open={openGroups} onOpenChange={setOpenGroups}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGroups}
                    className="w-full justify-between"
                  >
                    {newUser.groups.length > 0 ? `${newUser.groups.length} grupos seleccionados` : "Seleccione grupos"}
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
                            onSelect={() => {
                              setNewUser({
                                ...newUser,
                                groups: newUser.groups.includes(group)
                                  ? newUser.groups.filter((g) => g !== group)
                                  : [...newUser.groups, group],
                              })
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newUser.groups.includes(group) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {group}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {newUser.groups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newUser.groups.map((group) => (
                    <Badge key={group} variant="secondary" className="flex items-center gap-1">
                      {group}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setNewUser({
                            ...newUser,
                            groups: newUser.groups.filter((g) => g !== group),
                          })
                        }
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

