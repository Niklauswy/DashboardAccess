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
import { Plus, ListFilter } from "lucide-react";
import { DataExport } from "@/components/data-export/DataExport";

export default function UserTableActions({ 
  columns, 
  visibleColumns, 
  toggleColumn, 
  sortedUsers, 
  setOpen,
  showColumnToggle = true 
}) {
  // Configurar columnas para exportación - eliminar la columna de acciones y usar etiquetas apropiadas
  const exportColumns = columns
    .filter(col => col.key !== 'accion')
    .map(col => ({
      key: col.key,
      header: col.label
    }));

  return (
    <div className="flex space-x-2 flex-shrink-0">
      {/* Solo mostrar el dropdown de columnas si se solicita */}
      {showColumnToggle && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 gap-1">
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Columnas</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mostrar/Ocultar Columnas</DropdownMenuLabel>
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
      )}

      {/* Componente de exportación que ahora usa las columnas seleccionadas */}
      <DataExport 
        data={sortedUsers}
        columns={exportColumns}
        selectedColumns={visibleColumns} // Pasar las columnas seleccionadas
        filename="usuarios_sistema"
        title="Reporte de Usuarios del Sistema"
        subtitle="Facultad de Ciencias"
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
