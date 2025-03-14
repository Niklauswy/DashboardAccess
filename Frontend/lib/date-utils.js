/**
 * Utilidades para formato de fechas 
 */
import React from 'react';

/**
 * Parsea una fecha desde varios formatos posibles
 * @param {string|Date} dateInput - Fecha en cualquier formato
 * @returns {Date|null} - Objeto Date o null si no se puede parsear
 */
export function parseDate(dateInput) {
  if (!dateInput) return null;
  
  if (dateInput instanceof Date) return dateInput;
  
  try {
    const dateStr = String(dateInput).trim();
    
    // Primera estrategia: construir como Date directamente
    let date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
    
    // Segunda estrategia: para formato "DD/MM/YYYY HH:MM:SS" (español)
    if (dateStr.includes('/')) {
      const parts = dateStr.split(' ');
      if (parts.length === 2) {
        const [datePart, timePart] = parts;
        const [day, month, year] = datePart.split('/').map(Number);
        if (day && month && year) {
          // Nota: En JavaScript, los meses son 0-indexed
          const timeComponents = timePart.split(':').map(Number);
          date = new Date(year, month - 1, day, 
            timeComponents[0] || 0, 
            timeComponents[1] || 0, 
            timeComponents[2] || 0);
          if (!isNaN(date.getTime())) return date;
        }
      }
    }
    
    // Tercera estrategia: para timestamp en segundos o milisegundos
    if (/^\d+$/.test(dateStr)) {
      const timestamp = parseInt(dateStr);
      // Distinguir entre timestamp en segundos (10 dígitos) y milisegundos (13 dígitos)
      date = new Date(dateStr.length <= 10 ? timestamp * 1000 : timestamp);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Si todas las estrategias fallan, devolver null
    console.warn(`No se pudo parsear la fecha: ${dateInput}`);
    return null;
  } catch (error) {
    console.warn(`Error parseando fecha: ${error.message}`);
    return null;
  }
}

/**
 * Formatea una fecha como string en formato local español
 * @param {string|Date} dateInput - Fecha a formatear
 * @param {Object} options - Opciones adicionales
 * @returns {string} - Fecha formateada
 */
export function formatDate(dateInput, options = {}) {
  try {
    const date = parseDate(dateInput);
    
    if (!date) return 'N/A';
    
    return date.toLocaleString('es-ES', {
      ...options
    });
  } catch (error) {
    console.warn('Error formateando fecha:', error);
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
    if (!dateInput) return { time: 'N/A', date: 'N/A' };
    
    const date = parseDate(dateInput);
    if (!date) return { time: 'N/A', date: 'N/A' };
    
    return {
      date: date.toLocaleDateString('es-ES'),     // Solo fecha: DD/MM/YYYY
      time: date.toLocaleTimeString('es-ES')      // Solo hora: HH:MM:SS
    };
  } catch (error) {
    console.warn('Error separando partes de fecha:', error);
    return { time: 'N/A', date: 'N/A' };
  }
}

/**
 * Renderiza un componente JSX con fecha y hora en formato estandarizado
 * @param {string|Date} dateInput - Fecha a formatear
 * @param className
 * @returns {JSX.Element} - Componente React con la fecha formateada
 */
export function DateTimeDisplay({ dateInput, className = "" }) {
  const { time, date } = formatDateParts(dateInput);
  
  return (
    <div className={`flex flex-col ${className}`}>
      <span>{time}</span>
      <span className="text-xs text-muted-foreground">{date}</span>
    </div>
  );
}

/**
 * Formatea una duración en segundos a formato hh:mm:ss
 * @param {number} seconds - Duración en segundos
 * @returns {string} - Duración formateada
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    seconds = parseInt(seconds); 
    if (isNaN(seconds)) return '00:00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Genera un objeto fecha que es comparable para ordenamiento
 * @param {string|Date} dateInput - Fecha a convertir
 * @returns {number} - Timestamp para comparación
 */
export function getDateForSorting(dateInput) {
  const date = parseDate(dateInput);
  return date ? date.getTime() : 0;
}
