import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Database, ListFilter } from "lucide-react";
import { DataExport } from "@/components/data-export/DataExport";

export default function UserTableActions({ columns, visibleColumns, toggleColumn, sortedUsers, setOpen }) {
  // Configurar columnas para exportación - eliminar la columna de acciones y usar etiquetas apropiadas
  const exportColumns = columns
    .filter(col => col.key !== 'accion')
    .map(col => ({
      key: col.key,
      header: col.label
    }));

  return (
    <div className="flex space-x-2 flex-shrink-0">
      {/* Otros botones existentes */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 gap-1">
            <ListFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Columnas</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) =>
            column.fixed ? null : (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Componente de exportación */}
      <DataExport 
        data={sortedUsers}
        columns={exportColumns}
        filename="usuarios_sistema"
        title="Reporte de Usuarios del Sistema"
        subtitle="Dashboard Access System"
        logo={{
          url: '/logo.png',
          width: 30,
          height: 30
        }}
        // Opciones para PDF
        options={{
          orientation: 'landscape',
          pageSize: 'a4'
        }}
      />

      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        <span>Agregar Usuario</span>
      </Button>
    </div>
  );
}
