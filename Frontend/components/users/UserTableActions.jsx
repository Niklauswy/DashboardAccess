import { Button } from "@/components/ui/button";
import { Eye, Check, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExportButton from '@/components/ExportButton';

export default function UserTableActions({
    columns,
    visibleColumns,
    toggleColumn,
    sortedUsers,
    setOpen
}) {
    return (
        <div className="flex items-center gap-4">
            {/* Column visibility dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {columns.filter((column) => !column.fixed).map((column) => (
                        <DropdownMenuItem key={column.key} onSelect={() => toggleColumn(column.key)}>
                            {visibleColumns.includes(column.key) ? 
                                <Check className="mr-2 h-4 w-4" /> : 
                                <X className="mr-2 h-4 w-4" />
                            }
                            {column.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Export functionality */}
            <ExportButton 
                data={sortedUsers}
                columns={columns.filter(col => col.key !== 'accion')}
                filename="usuarios"
            />
            
            {/* Add user button */}
            <Button onClick={() => setOpen(true)}>
                Agregar Usuario
            </Button>
            
        </div>
    );
}
