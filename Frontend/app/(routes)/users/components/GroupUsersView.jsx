"use client";

import {useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {UserCheck, UsersRound} from "lucide-react";

export default function GroupUsersView({ users }) {
  const [selectedGroup, setSelectedGroup] = useState("");
  
  // Extract all unique groups from users
  const groups = useMemo(() => {
    const allGroups = new Set();
    
    users.forEach(user => {
      if (user.groups && Array.isArray(user.groups)) {
        user.groups.forEach(group => {
          if (group) allGroups.add(group);
        });
      }
    });
    
    return [...allGroups].sort();
  }, [users]);
  
  // Filter users by selected group
  const filteredUsers = useMemo(() => {
    if (!selectedGroup) return [];
    
    return users.filter(user => 
      user.groups && 
      Array.isArray(user.groups) && 
      user.groups.includes(selectedGroup)
    ).sort((a, b) => a.username.localeCompare(b.username));
  }, [users, selectedGroup]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UsersRound className="h-5 w-5 mr-2" />
          Usuarios por Grupo
        </CardTitle>
        <CardDescription>
          Seleccione un grupo para ver todos sus usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedGroup}
            onValueChange={setSelectedGroup}
            disabled={groups.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups.map(group => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedGroup && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Carrera</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.username || user.samAccountName}>
                        <TableCell className="font-medium">
                          {user.username || user.samAccountName}
                        </TableCell>
                        <TableCell>{user.givenName}</TableCell>
                        <TableCell>{user.sn}</TableCell>
                        <TableCell>
                          {user.ou ? (
                            <Badge variant="outline">{user.ou}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <UserCheck className="h-12 w-12 mb-2" />
                          <span>No se encontraron usuarios para este grupo</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
      {selectedGroup && filteredUsers.length > 0 && (
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{filteredUsers.length}</span> usuarios en el grupo <span className="font-medium">{selectedGroup}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
