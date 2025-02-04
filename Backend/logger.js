import fs from 'fs';
import path from 'path';

// Asegúrate de que exista la carpeta 'logs' en la raíz del proyecto.
const logFilePath = path.join(process.cwd(), 'logs', 'user-activity.log');

export function logActivity(user, action, details = '') {
  const userInfo = user ? `${user.name} (${user.email || 'N/A'})` : 'Anónimo';
  const logEntry = `[${new Date().toISOString()}] User: ${userInfo} - Action: ${action} ${details}\n`;
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) console.error("Error escribiendo log:", err);
  });
}
