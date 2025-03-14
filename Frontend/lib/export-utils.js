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
  

  if (column.accessorFn) {
    return column.accessorFn(row) || '';
  }
x
  if (column.exportValue) {
    return typeof column.exportValue === 'function'
      ? column.exportValue(row)
      : row[column.exportValue] || '';
  }
  
  return row[key] !== undefined ? row[key] : '';
};

/**
 * Configura página PDF con logo y encabezados en estilo UABC
 * @param {Object} doc - Documento jsPDF
 * @param {String} title - Título del documento
 * @param {String} subtitle - Subtítulo del documento
 * @param {Object} logo - Configuración del logo
 */
const setupPdfPage = (doc, title, subtitle, logo) => {
  // Configurar márgenes y estilo base
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // Colores de UABC
  const uabcGreen = [0, 121, 52];
  const uabcGold = [206, 142, 0];
  
  // Agregar encabezado con colores UABC
  doc.setFillColor(...uabcGreen);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Añadir logo si está presente
  if (logo && logo.url) {
    doc.addImage(
      logo.url,
      'PNG',
      margin,
      10,
      logo.width || 40,
      logo.height || 20
    );
  } 
  
  // Título a la derecha del logo
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Subtítulo 
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });
  }
  
  // Barra decorativa dorada
  doc.setFillColor(...uabcGold);
  doc.rect(0, 40, pageWidth, 5, 'F');
  
  // Agregar fecha y hora de generación
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, pageWidth - margin, 55);
  
  // Retornar la posición Y donde debería empezar el contenido
  return 65; // Posición después del encabezado completo
};

/**
 * Exporta datos a PDF con diseño mejorado estilo UABC
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
  
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });
  
  const margin = 20;
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
      fillColor: [0, 121, 52],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [206, 142, 0]
    },
    bodyStyles: {
      textColor: 80
    },
    theme: 'grid'
  };
  
  const tableStyles = { ...defaultStyles, ...customStyles };
  
  // Generar tabla
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: startY,
    styles: tableStyles.bodyStyles,
    headStyles: tableStyles.headStyles,
    alternateRowStyles: tableStyles.alternateRowStyles,
    theme: tableStyles.theme,
    pageBreak: 'auto',
    margin: { top: 50, right: 20, bottom: 30, left: 20 },
    ...autoTableOptions,
    didDrawPage: function(data) {
      // Regenerar encabezado en cada página
      setupPdfPage(doc, title, subtitle, logo);
      
      // Agregar pie de página en cada página
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      
      // Línea separadora en el pie de página
      doc.setDrawColor(0, 121, 52);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      // Agregar numeración de página
      const pageNumber = `Página ${doc.internal.getNumberOfPages()}`;
      doc.text(pageNumber, margin, pageHeight - 10);
      
      const uabcName = 'Universidad Autónoma de Baja California';
      doc.text(uabcName, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Agregar texto de FCCC
      const facultyName = 'Facultad de Ciencias';
      doc.text(facultyName, pageWidth - margin, pageHeight - 10, { align: 'right' });
      

      if (autoTableOptions.didDrawPage) {
        autoTableOptions.didDrawPage(data);
      }
    }
  });
  
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
  
  // r headers
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
  creator = 'Reporte'
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
  
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  

  XLSX.writeFile(wb, `${filename}.xlsx`);
};
