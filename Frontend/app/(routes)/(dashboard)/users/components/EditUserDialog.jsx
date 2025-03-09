import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOusAndGroups } from "@/hooks/useOusAndGroups";
import { useUsers } from "@/hooks/useUsers";

// Schema de validación
const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  ou: z.string().min(1, "La carrera es requerida"),
  groups: z.array(z.string()),
  password: z.string().optional()
});

export default function EditUserDialog({ open, onOpenChange, currentUser, onUpdate }) {
  const { ous, groups: allGroups, isLoading } = useOusAndGroups();
  const { updateUser } = useUsers();
  const [openGroups, setOpenGroups] = useState(false);
  const previousFocusRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      ou: "",
      groups: [],
      password: ""
    }
  });

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
    } else {
      // Reset form when dialog closes
      form.reset({
        name: "",
        ou: "",
        groups: [],
        password: ""
      });
      
      // Force focus back to previous element after dialog closes
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        setTimeout(() => {
          previousFocusRef.current.focus();
        }, 0);
      }
    }
  }, [open, form]);

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || "",
        ou: currentUser.ou || "",
        groups: currentUser.groups || [],
        password: ""
      });
    }
  }, [currentUser, form]);

  const onSubmit = async (data) => {
    try {
      await updateUser(currentUser.username, {
        ...data,
        ...(data.password ? { password: data.password } : {})
      });
      
      // Close dialog first, then update
      onOpenChange(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Close handler with cleanup
  const handleClose = () => {
    setOpenGroups(false); // Close any open popovers
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpenGroups(false);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]"
        aria-describedby="edit-user-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Editando {currentUser?.username}</DialogTitle>
          <DialogDescription id="edit-user-description">
            Modifique los datos del usuario y guarde los cambios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ou"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una carrera" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ous.map((ou) => (
                          <SelectItem key={ou} value={ou}>{ou}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nueva contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupos</FormLabel>
                    <Popover open={openGroups} onOpenChange={setOpenGroups}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {field.value.length > 0 ? `${field.value.length} grupos seleccionados` : "Seleccione grupos"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar grupos..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                            <CommandGroup>
                              {allGroups?.map((group) => (
                                <CommandItem
                                  key={group}
                                  onSelect={() => {
                                    const newGroups = field.value.includes(group)
                                      ? field.value.filter(g => g !== group)
                                      : [...field.value, group];
                                    field.onChange(newGroups);
                                  }}
                                >
                                  <Check className={`mr-2 h-4 w-4 ${field.value.includes(group) ? "opacity-100" : "opacity-0"}`} />
                                  {group}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((group) => (
                          <div key={group} className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1">
                            <span>{group}</span>
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => field.onChange(field.value.filter(g => g !== group))}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}