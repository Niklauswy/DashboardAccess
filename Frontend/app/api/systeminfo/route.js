import { promises as fs } from 'fs';
import os from 'os';
import checkDiskSpace from 'check-disk-space'; // Asegúrate de instalar esta dependencia

export async function GET() {
    try {
        const uptime = os.uptime(); // Tiempo de actividad en segundos
        const load = os.loadavg(); // Promedio de carga del sistema [1, 5, 15 minutos]
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const storagePath = '/'; // Ruta de la partición que deseas monitorear
        const diskSpace = await checkDiskSpace(storagePath);

        const systemInfo = {
            time: new Date().toLocaleTimeString(), // Hora actual
            coreVersion: '8.0.3', // Actualizar dinámicamente si es posible
            software: '1 component updates, 120 system updates (80 security)', // Actualizar dinámicamente si es posible
            systemLoad: load.map(l => l.toFixed(2)).join(', '),
            uptime: formatUptime(uptime),
            storage: `${(diskSpace.used / 1e9).toFixed(1)} GB / ${(diskSpace.size / 1e9).toFixed(1)} GB (${diskSpace.capacity}%)`
        };

        return new Response(JSON.stringify(systemInfo), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
        return new Response(JSON.stringify({ error: 'Unable to fetch system info' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

function formatUptime(seconds) {
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 3600) % 24;
    const days = Math.floor(seconds / 86400);
    return `${days}d ${hours}h ${minutes}m`;
}