/**
 * Utilidades para formato de fechas 
 */

/**
 * Formatea una fecha como string en formato local español
 * @param {string|Date} dateInput - Fecha a formatear
 * @param {Object} options - Opciones adicionales
 * @returns {string} - Fecha formateada
 */
export function formatDate(dateInput, options = {}) {
  try {
    // Si no hay fecha, devolver placeholder
    if (!dateInput) return 'N/A';
    
    // Crear objeto Date (si ya es un objeto Date, esto no hace nada)
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Verificar si es una fecha válida
    if (isNaN(date.getTime())) throw new Error('Fecha inválida');
    
    return date.toLocaleString('es-ES', {
      // Opciones predeterminadas que se pueden sobrescribir
      ...options
    });
  } catch (error) {
    console.warn('Error formateando fecha:', error);
    // Devolver la entrada original como fallback
    return String(dateInput || 'N/A');
  }
}

/**
 * Formatea una fecha para mostrar con hora destacada y fecha más pequeña
 * @param {string|Date} dateInput - Fecha a formatear
 * @returns {Object} - {time, date} con partes formateadas
 */
export function formatDateParts(dateInput) {
  try {
    // Si no hay fecha, devolver valores por defecto
    if (!dateInput) return { time: 'N/A', date: 'N/A' };
    
    const dateString = formatDate(dateInput);
    const parts = dateString.split(', ');
    
    return {
      date: parts[0] || 'N/A',           // La fecha (ej: 13/3/2025)
      time: parts[1] || parts[0] || 'N/A' // La hora o toda la cadena si no hay coma
    };
  } catch (error) {
    console.warn('Error separando partes de fecha:', error);
    return { time: 'N/A', date: 'N/A' };
  }
}

/**
 * Renderiza un componente JSX con fecha y hora en formato estandarizado
 * @param {string|Date} dateInput - Fecha a formatear
 * @returns {Object} - Objeto con propiedades para el JSX
 */
export function getDateTimeDisplay(dateInput) {
  const { time, date } = formatDateParts(dateInput);
  
  return {
    time,
    date,
    render: (
      <div className="flex flex-col">
        <span>{time}</span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </div>
    )
  };
}

/**
 * Formatea una duración en segundos a formato hh:mm:ss
 * @param {number} seconds - Duración en segundos
 * @returns {string} - Duración formateada
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
