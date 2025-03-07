import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown, X } from "lucide-react";

export default function UserTableFilters({
    filter,
    setFilter,
    selectedCarreras,
    selectedGroups,
    toggleCarrera,
    toggleGroup,
    clearCarreraFilter,
    clearGroupFilter,
    availableCarreras,
    availableGroups,
    users,
    careerIcons
}) {
    return (
        <div className="flex-grow flex flex-wrap items-center gap-3">
            <Input
                placeholder="Filtrar usuarios..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full sm:w-auto max-w-sm flex-shrink-0"
            />
            
            {/* Carreras dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Filter className="mr-2 h-4 w-4" />
                        Carreras
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    {availableCarreras.map((carrera) => {
                        const count = Array.isArray(users) ? users.filter(
                            (user) =>
                                user.ou === carrera &&
                                (selectedGroups.length === 0 || user.groups?.some(group => selectedGroups.includes(group)))
                        ).length : 0;
                        return (
                            <DropdownMenuItem key={carrera} onSelect={() => toggleCarrera(carrera)}>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        {careerIcons[carrera]}
                                        <span className="ml-2">{carrera}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Badge variant="secondary" className="mr-2">
                                            {count}
                                        </Badge>
                                        <Checkbox checked={selectedCarreras.includes(carrera)} />
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                    {availableCarreras.length > 0 && (
                        <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem onSelect={clearCarreraFilter}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar filtros
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Selected career badges */}
            {selectedCarreras.map((carrera) => (
                <Badge key={carrera} variant="secondary" className="px-2 py-1">
                    {carrera}
                    <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => toggleCarrera(carrera)}>
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}
            
            {/* Groups dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Filter className="mr-2 h-4 w-4" />
                        Grupos
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    {availableGroups.map((group) => {
                        const count = Array.isArray(users) ? users.filter(
                            (user) =>
                                user.groups?.includes(group) &&
                                (selectedCarreras.length === 0 || selectedCarreras.includes(user.ou))
                        ).length : 0;
                        return (
                            <DropdownMenuItem key={group} onSelect={() => toggleGroup(group)}>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center">
                                        <span className="ml-2">{group}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Badge variant="secondary" className="mr-2">
                                            {count}
                                        </Badge>
                                        <Checkbox checked={selectedGroups.includes(group)} />
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                    {availableGroups.length > 0 && (
                        <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem onSelect={clearGroupFilter}>
                        <X className="mr-2 h-4 w-4" />
                        Limpiar filtros
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Selected group badges */}
            {selectedGroups.map((group) => (
                <Badge key={group} variant="secondary" className="px-2 py-1">
                    {group}
                    <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={() => toggleGroup(group)}>
                        <X className="h-3 w-3" />
                    </Button>
                </Badge>
            ))}
        </div>
    );
}
