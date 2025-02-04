'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AddUserForm({ refreshUsers, onClose }) {
  const { toast } = useToast();
  const [newUser, setNewUser] = useState({
    samAccountName: '',
    givenName: '',
    sn: '',
    password: '',
    ou: '',
    groups: [],
  });
  const [ous, setOus] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const ouRes = await fetch('/api/ous');
      const ouData = await ouRes.json();
      setOus(ouData);
      const groupRes = await fetch('/api/groups');
      const groupData = await groupRes.json();
      setGroups(groupData);
    }
    fetchData();
  }, []);

  async function handleAddUser(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        onClose();
        setNewUser({
          samAccountName: '',
          givenName: '',
          sn: '',
          password: '',
          ou: '',
          groups: [],
        });
        await refreshUsers();
        toast({
          title: "Usuario creado",
          description: `El usuario ${newUser.samAccountName} ha sido creado exitosamente.`,
        });
      } else {
        toast({
          title: "Error",
          description: `Error: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: 'Error inesperado al agregar el usuario.',
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={handleAddUser} className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Usuario */}
        <div className="flex flex-col">
          <Label htmlFor="samAccountName">Usuario</Label>
          <Input id="samAccountName" value={newUser.samAccountName} onChange={(e) => setNewUser({ ...newUser, samAccountName: e.target.value })} required />
        </div>
        {/* Nombre */}
        <div className="flex flex-col">
          <Label htmlFor="givenName">Nombre</Label>
          <Input id="givenName" value={newUser.givenName} onChange={(e) => setNewUser({ ...newUser, givenName: e.target.value })} required />
        </div>
        {/* Apellido */}
        <div className="flex flex-col">
          <Label htmlFor="sn">Apellido</Label>
          <Input id="sn" value={newUser.sn} onChange={(e) => setNewUser({ ...newUser, sn: e.target.value })} required />
        </div>
        {/* Contraseña */}
        <div className="flex flex-col">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
        </div>
        {/* Unidad Organizativa */}
        <div className="flex flex-col">
          <Label htmlFor="ou">Unidad Organizativa</Label>
          <select
            id="ou"
            value={newUser.ou}
            onChange={(e) => setNewUser({ ...newUser, ou: e.target.value })}
            required
            className="border rounded p-2"
          >
            <option value="">Seleccione una unidad</option>
            {ous.map((ou) => (
              <option key={ou} value={ou}>{ou}</option>
            ))}
          </select>
        </div>
        {/* Grupos */}
        <div className="flex flex-col">
          <Label htmlFor="groups">Grupos</Label>
          <select
            id="groups"
            multiple
            value={newUser.groups}
            onChange={(e) =>
              setNewUser({ ...newUser, groups: Array.from(e.target.selectedOptions, option => option.value) })
            }
            required
            className="border rounded p-2 h-32"
          >
            {groups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="w-full md:w-auto">
          Agregar
        </Button>
      </div>
    </form>
  );
}
