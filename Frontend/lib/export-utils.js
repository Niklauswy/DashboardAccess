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
 * Configura página PDF con logo y encabezados en estilo UABC
 * @param {Object} doc - Documento jsPDF
 * @param {String} title - Título del documento
 * @param {String} subtitle - Subtítulo del documento
 * @param {Object} logo - Configuración del logo
 */
const setupPdfPage = (doc, title, subtitle, logo) => {
  // Configurar márgenes y estilo base
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  
  // Colores de UABC
  const uabcGreen = [0, 102, 94]; // Verde UABC
  const uabcGold = [207, 184, 124]; // Dorado UABC
  
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
  } else {
    // Si no hay logo, poner texto UABC como alternativa
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('UABC', margin, 25);
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
  
  // Estilos para la tabla con colores UABC
  const defaultStyles = {
    headStyles: {
      fillColor: [0, 102, 94], // Verde UABC
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    bodyStyles: {
      textColor: 80
    },
    theme: 'grid' // Añadir cuadrícula para mejorar legibilidad
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
      doc.setDrawColor(0, 102, 94); // Verde UABC
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      // Agregar numeración de página
      const pageNumber = `Página ${doc.internal.getNumberOfPages()}`;
      doc.text(pageNumber, margin, pageHeight - 10);
      
      // Agregar nombre de la universidad
      const uabcName = 'Universidad Autónoma de Baja California';
      doc.text(uabcName, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Agregar texto de Facultad de Ciencias
      const facultyName = 'Facultad de Ciencias';
      doc.text(facultyName, pageWidth - margin, pageHeight - 10, { align: 'right' });
      
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
