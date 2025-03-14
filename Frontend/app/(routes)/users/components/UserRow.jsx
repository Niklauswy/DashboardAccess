import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {MoreHorizontal} from "lucide-react";
import {TableCell, TableRow} from "@/components/ui/table";
import {DateTimeDisplay} from "@/lib/date-utils";

const UserRow = ({ 
  user, 
  onEdit, 
  selected, 
  onToggleSelect, 
  visibleColumns, 
  columns 
}) => {
  // Función para renderizar una celda específica basada en la key de la columna
  const renderCell = (columnKey) => {
    switch(columnKey) {
      case 'username':
        return <TableCell className="font-medium">{user.username}</TableCell>;
      
      case 'givenName':
        return <TableCell className="font-medium">{user.givenName}</TableCell>;
        
      case 'sn':
        return <TableCell className="font-medium">{user.sn}</TableCell>;
        
      case 'ou':
        return <TableCell><Badge variant="primary">{user.ou}</Badge></TableCell>;
        
      case 'logonCount':
        return <TableCell>{user.logonCount}</TableCell>;
        
      case 'lastLogon':
        return <TableCell>
          <DateTimeDisplay dateInput={user.lastLogon} />
        </TableCell>;
        
      case 'groups':
        return <TableCell>
          <div className="flex flex-wrap gap-1 max-w-xs">
            {user.groups?.map((group) => (
              <Badge key={group} variant="secondary">
                {group}
              </Badge>
            ))}
          </div>
        </TableCell>;
        
      case 'accion':
        return <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
              <DropdownMenuItem>Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>;
        
      default:
        // Para cualquier otra columna, intentar mostrar el valor directamente
        return <TableCell>{user[columnKey] || '-'}</TableCell>;
    }
  };
  
  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          checked={selected} 
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${user.username}`} 
        />
      </TableCell>

      {/* Renderizar solo las celdas de columnas que están visibles */}
      {columns
        .filter(col => visibleColumns.includes(col.key))
        .map(col => renderCell(col.key))}
    </TableRow>
  );
};

export default UserRow;