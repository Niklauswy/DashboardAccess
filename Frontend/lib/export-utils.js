import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * Obtiene el valor de una celda para la exportación
 * @param {Object} row - Fila de datos
 * @param {Object} column - Definición de columna
 * @returns {String} - Valor formateado para exportación
 */
export const getCellValue = (row, column) => {
  const key = column.key || column.accessorKey || column.id;
  
  if (!key) return '';
  
  // Si hay un accessorFn, usarlo
  if (column.accessorFn) {
    return column.accessorFn(row) || '';
  }
  
  // Si hay un getter específico para exportar
  if (column.exportValue) {
    return typeof column.exportValue === 'function'
      ? column.exportValue(row)
      : row[column.exportValue] || '';
  }
  
  // Usar valor directo
  return row[key] !== undefined ? row[key] : '';
};

/**
 * Configura página PDF con logo y encabezados
 * @param {Object} doc - Documento jsPDF
 * @param {String} title - Título del documento
 * @param {String} subtitle - Subtítulo del documento
 * @param {Object} logo - Configuración del logo
 */
const setupPdfPage = (doc, title, subtitle, logo) => {
  // Configurar márgenes y estilo base
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Añadir logo si está presente
  if (logo && logo.url) {
    doc.addImage(
      logo.url,
      'PNG',
      margin,
      margin,
      logo.width || 40,
      logo.height || 20
    );
  }
  
  // Añadir título
  doc.setFontSize(18);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, logo ? margin + 25 : margin + 10, { align: 'center' });
  
  // Añadir subtítulo si está presente
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, logo ? margin + 35 : margin + 20, { align: 'center' });
  }
  
  // Agregar fecha y hora de generación
  const dateText = `Generado el: ${new Date().toLocaleString('es-ES')}`;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(dateText, pageWidth - margin, margin, { align: 'right' });
  
  // Retornar la posición Y donde debería empezar el contenido
  return logo ? margin + 45 : margin + 30;
};

/**
 * Exporta datos a PDF con diseño mejorado
 * @param {Object} options - Opciones de exportación
 */
export const exportToPdf = async ({
  data,
  columns,
  filename = 'exportacion',
  title = 'Reporte',
  subtitle = '',
  logo = null,
  orientation = 'landscape',
  pageSize = 'a4',
  customStyles = {},
  autoTableOptions = {}
}) => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }
  
  // Inicializar PDF
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });
  
  // Configurar página y obtener posición inicial para la tabla
  const startY = setupPdfPage(doc, title, subtitle, logo);
  
  // Preparar headers y filas para autoTable
  const headers = columns.map(col => col.header || col.label || col.key || '');
  const rows = data.map(row => 
    columns.map(column => {
      const value = getCellValue(row, column);
      return value !== null && value !== undefined ? value.toString() : '';
    })
  );
  
  // Estilos para la tabla
  const defaultStyles = {
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    bodyStyles: {
      textColor: 80
    }
  };
  
  // Combinar estilos predeterminados con personalizados
  const tableStyles = { ...defaultStyles, ...customStyles };
  
  // Generar tabla
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: startY,
    styles: tableStyles.bodyStyles,
    headStyles: tableStyles.headStyles,
    alternateRowStyles: tableStyles.alternateRowStyles,
    pageBreak: 'auto',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    ...autoTableOptions,
    didDrawPage: function(data) {
      // Agregar pie de página en cada página
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      // Agregar numeración de página
      const pageNumber = `Página ${doc.internal.getNumberOfPages()}`;
      doc.text(pageNumber, data.settings.margin.left, pageHeight - 10);
      
      // Agregar nombre del sistema
      const appName = 'Dashboard Access System';
      doc.text(appName, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
      
      // Si hay una función personalizada para el pie de página, ejecutarla
      if (autoTableOptions.didDrawPage) {
        autoTableOptions.didDrawPage(data);
      }
    }
  });
  
  // Guardar archivo
  doc.save(`${filename}.pdf`);
};

/**
 * Exporta datos a CSV
 * @param {Object} options - Opciones de exportación
 */
export const exportToCsv = ({
  data,
  columns,
  filename = 'exportacion',
  delimiter = ',',
  includeHeaders = true
}) => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }
  
  // Obtener headers
  const headers = columns.map(col => col.header || col.label || col.key || '');
  
  // Formatear filas
  const rows = data.map(row => 
    columns.map(column => {
      const value = getCellValue(row, column);
      // Escapar comillas y delimitadores en valores string
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== null && value !== undefined ? value : '';
    })
  );
  
  // Combinar en un solo string CSV
  let csvContent = '';
  
  // Añadir headers si se solicita
  if (includeHeaders) {
    csvContent += headers.map(header => `"${header.replace(/"/g, '""')}"`).join(delimiter) + '\n';
  }
  
  // Añadir filas
  csvContent += rows.map(row => row.join(delimiter)).join('\n');
  
  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

/**
 * Exporta datos a Excel
 * @param {Object} options - Opciones de exportación
 */
export const exportToExcel = ({
  data,
  columns,
  filename = 'exportacion',
  title = 'Reporte',
  sheetName = 'Datos',
  creator = 'Dashboard Access System'
}) => {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }
  
  // Obtener headers
  const headers = columns.map(col => col.header || col.label || col.key || '');
  
  // Preparar filas
  const rows = data.map(row => 
    columns.map(column => getCellValue(row, column))
  );
  
  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  
  // Configurar propiedades
  wb.Props = {
    Title: title,
    CreatedDate: new Date(),
    LastModifiedDate: new Date(),
    Creator: creator
  };
  
  // Crear hoja de cálculo con los datos
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Añadir hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generar archivo Excel y descargarlo
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
