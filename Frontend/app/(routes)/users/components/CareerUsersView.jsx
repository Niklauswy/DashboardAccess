"use client";

import {useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {GraduationCap, UserCheck} from "lucide-react";

export default function CareerUsersView({ users }) {
  const [selectedCareer, setSelectedCareer] = useState("");
  
  // Extract all unique careers from users
  const careers = useMemo(() => {
    const allCareers = new Set();
    
    users.forEach(user => {
      if (user.ou) allCareers.add(user.ou);
    });
    
    return [...allCareers].sort();
  }, [users]);
  
  // Filter users by selected career
  const filteredUsers = useMemo(() => {
    if (!selectedCareer) return [];
    
    return users.filter(user => user.ou === selectedCareer)
      .sort((a, b) => a.username?.localeCompare(b.username) || a.samAccountName?.localeCompare(b.samAccountName) || 0);
  }, [users, selectedCareer]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          Usuarios por Carrera
        </CardTitle>
        <CardDescription>
          Seleccione una carrera para ver todos sus usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedCareer}
            onValueChange={setSelectedCareer}
            disabled={careers.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar carrera" />
            </SelectTrigger>
            <SelectContent>
              {careers.map(career => (
                <SelectItem key={career} value={career}>
                  {career}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedCareer && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Grupos</TableHead>
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
                        <TableCell className="max-w-[200px] truncate">
                          <div className="flex flex-wrap gap-1">
                            {user.groups?.map(group => (
                              <Badge key={group} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            )) || "-"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <UserCheck className="h-12 w-12 mb-2" />
                          <span>No se encontraron usuarios para esta carrera</span>
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
      {selectedCareer && filteredUsers.length > 0 && (
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{filteredUsers.length}</span> usuarios en la carrera <span className="font-medium">{selectedCareer}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
