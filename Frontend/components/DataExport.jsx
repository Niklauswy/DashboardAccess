import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Download, FileText, FileSpreadsheet, Loader2, 
  ChevronDown, Table as TableIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { exportToPdf, exportToCsv, exportToExcel } from '@/lib/export-utils';

/**
 * Componente reutilizable para exportar datos en diferentes formatos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos a exportar
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.selectedColumns - Columnas seleccionadas (opcional)
 * @param {String} props.filename - Nombre del archivo (sin extensión)
 * @param {String} props.title - Título para los reportes
 * @param {String} props.subtitle - Subtítulo opcional para los reportes
 * @param {Object} props.logo - Configuración del logo {url, width, height}
 * @param {Object} props.options - Opciones adicionales de exportación
 * @param {String} props.variant - Variante de UI: 'dropdown' (default) o 'buttons'
 * @returns {JSX.Element} Componente de exportación de datos
 */
export function DataExport({
  data = [],
  columns = [],
  selectedColumns = null, // Nueva prop para recibir columnas ya seleccionadas
  filename = 'exportacion',
  title = 'Reporte',
  subtitle = '',
  logo = null,
  options = {},
  variant = 'dropdown',
  className = '',
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Si se proporcionan columnas seleccionadas externas, las usamos
  // Si no, tomamos todas las columnas
  const columnsToExport = useMemo(() => {
    // Si hay columnas seleccionadas externas, filtrar por ellas
    if (selectedColumns) {
      return columns.filter(col => {
        const key = col.key || col.accessorKey || col.id;
        return selectedColumns.includes(key);
      });
    }
    // Si no, usar todas las columnas
    return columns;
  }, [columns, selectedColumns]);

  // Función para exportar datos basada en el formato seleccionado
  const handleExport = async (format) => {
    // Comprobar explícitamente si hay datos para exportar
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "No existen registros disponibles para exportar en este momento.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      setExportFormat(format);
      
      // Elegir método de exportación según el formato
      switch (format) {
        case 'pdf':
          await exportToPdf({
            data, 
            columns: columnsToExport, 
            filename, 
            title, 
            subtitle,
            logo,
            ...options
          });
          break;
        case 'csv':
          exportToCsv({
            data, 
            columns: columnsToExport, 
            filename,
            ...options
          });
          break;
        case 'excel':
          await exportToExcel({
            data, 
            columns: columnsToExport, 
            filename,
            title,
            ...options
          });
          break;
        default:
          throw new Error(`Formato de exportación no soportado: ${format}`);
      }

      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados en formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Error al exportar datos", error);
      toast({
        title: "Error en la exportación",
        description: error.message || "Ocurrió un error al exportar los datos.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  // Deshabilitar el botón cuando no hay datos
  const hasData = Array.isArray(data) && data.length > 0;

  // Renderizar los botones individuales
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          {isExporting && exportFormat === 'pdf' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          PDF
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          {isExporting && exportFormat === 'csv' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          CSV
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('excel')}
          disabled={isExporting}
        >
          {isExporting && exportFormat === 'excel' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          )}
          Excel
        </Button>
      </div>
    );
  }

  // Renderizar menú desplegable (por defecto)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isExporting || !hasData}
          className={className}
          title={!hasData ? "No hay datos disponibles para exportar" : "Exportar datos"}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exportar
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Opciones de Exportación</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Exportar como PDF</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <TableIcon className="mr-2 h-4 w-4" />
          <span>Exportar como CSV</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Exportar como Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
