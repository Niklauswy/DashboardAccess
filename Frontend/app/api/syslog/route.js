
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        const syslogPath = '/var/log/syslog'; 
        const data = await fs.readFile(syslogPath, 'utf-8');
        const lines = data.split('\n').slice(-100); // Usar solo las últimas 100 líneas
        return new Response(JSON.stringify({ syslog: lines }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Unable to read syslog' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}