import os from 'os';
import checkDiskSpace from 'check-disk-space';

export async function GET() {
    try {
        const uptime = os.uptime();
        const load = os.loadavg();
        const host = os.hostname();
        let domain = "N/A";
        if (host.includes('.')) {
          domain = host.split('.').slice(1).join('.');
        }
        const storagePath = '/';
        const diskSpace = await checkDiskSpace(storagePath);
        const used = diskSpace.size - diskSpace.free;
        const capacity = ((used / diskSpace.size) * 100).toFixed(1);
        
        const systemInfo = {
            time: new Date().toLocaleTimeString(), 
            hostname: host,
            domain,
            coreVersion: '8.0.3',
            software: '1 component updates, 120 system updates (80 security)',
            systemLoad: load.map(l => l.toFixed(2)).join(', '),
            uptime: formatUptime(uptime),
            storage: `${(used / 1e9).toFixed(1)} GB / ${(diskSpace.size / 1e9).toFixed(1)} GB (${capacity}%)`
        };

        return new Response(JSON.stringify(systemInfo), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store'
            },
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