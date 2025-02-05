import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";

export default function EditUserDialog({ open, onOpenChange, currentUser, onUpdate }) {
  // Estados para OU y grupos disponibles
  const [ous, setOus] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  // Estados locales para editar
  const [editUser, setEditUser] = useState({
    name: "",
    ou: "",
    groups: [],
    password: "",
  });
  const [openGroups, setOpenGroups] = useState(false);

  // Cuando currentUser cambia, inicializa el estado de edición
  useEffect(() => {
    if (currentUser) {
      setEditUser({
        name: currentUser.name || "",
        ou: currentUser.ou || "",
        groups: currentUser.groups || [],
        password: ""
      });
    }
  }, [currentUser]);

  // Fetch de Ous y Grupos
  useEffect(() => {
    async function fetchData() {
      const ouRes = await fetch("/api/ous");
      const ouData = await ouRes.json();
      setOus(ouData);
      const groupRes = await fetch("/api/groups");
      const groupData = await groupRes.json();
      setAllGroups(groupData);
    }
    fetchData();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onUpdate({
      ...currentUser,
      name: editUser.name,
      ou: editUser.ou,
      groups: editUser.groups,
      // Solo se envía nueva contraseña si se ingresó
      ...(editUser.password ? { password: editUser.password } : {})
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editando {currentUser?.username} </DialogTitle>
        </DialogHeader>
        <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="editName">Nombre</Label>
              <Input 
                id="editName"
                defaultValue={editUser.name}
                onChange={(e) => setEditUser({...editUser, name: e.target.value})}
              />
            </div>
            {/* Unidad Organizativa con Select */}
            <div className="space-y-2">
              <Label htmlFor="editOu">Unidad Organizativa</Label>
              <Select 
                value={editUser.ou} 
                onValueChange={(value) => setEditUser({...editUser, ou: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una unidad" />
                </SelectTrigger>
                <SelectContent>
                  {ous.map((ou) => (
                    <SelectItem key={ou} value={ou}>{ou}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

                 {/* Contraseña */}
                 <div className="space-y-2">
              <Label htmlFor="editPassword">Contraseña</Label>
              <Input 
                id="editPassword" 
                type="password" 
                placeholder="Nueva contraseña"
                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
              />
            </div>
            
            {/* Grupos con Popover y Command */}
            <div className="space-y-2">
              <Label>Grupos</Label>
              <Popover open={openGroups} onOpenChange={setOpenGroups}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {editUser.groups.length > 0 ? `${editUser.groups.length} grupos seleccionados` : "Seleccione grupos"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar grupos..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                      <CommandGroup>
                        {allGroups.map((group) => (
                          <CommandItem
                            key={group}
                            onSelect={() => {
                              if(editUser.groups.includes(group)){
                                setEditUser({
                                  ...editUser,
                                  groups: editUser.groups.filter(g => g !== group)
                                })
                              } else {
                                setEditUser({
                                  ...editUser,
                                  groups: [...editUser.groups, group]
                                })
                              }
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${editUser.groups.includes(group) ? "opacity-100" : "opacity-0"}`} />
                            {group}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {editUser.groups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editUser.groups.map((group) => (
                    <div key={group} className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1">
                      <span>{group}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setEditUser({...editUser, groups: editUser.groups.filter(g => g !== group)})}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
       
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
