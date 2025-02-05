import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown, X } from "lucide-react";

export default function UserFilters({ users, filter, setFilter, selectedCarreras, toggleCarrera, clearCarreraFilter, selectedGroups, toggleGroup, clearGroupFilter }) {
  // Calcula opciones de filtros
  const availableCarreras = useMemo(() => users ? [...new Set(users.map(u => u.ou).filter(Boolean))] : [], [users]);
  const availableGroups = useMemo(() => users ? [...new Set(users.flatMap(u => u.groups || []))] : [], [users]);
  
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Input placeholder="Filtrar usuarios..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Carreras <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {availableCarreras.map(carrera => (
              <DropdownMenuItem key={carrera} onSelect={() => toggleCarrera(carrera)}>
                {carrera}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={clearCarreraFilter}>
              <X className="mr-2 h-4 w-4" /> Limpiar filtros
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Repetir para grupos si se requiere */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Grupos <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {availableGroups.map(group => (
              <DropdownMenuItem key={group} onSelect={() => toggleGroup(group)}>
                {group}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={clearGroupFilter}>
              <X className="mr-2 h-4 w-4" /> Limpiar filtros
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Se pueden agregar botones adicionales, ej. "Agregar Usuario" */}
    </div>
  );
}
